var fs = require("fs");
var i18n = require('i18n');
var rest = require('restler');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    this.logging = require('node-logging');
    var self = this;

    this.setupExpress(function () {
        log.dbg('Express setup complete ..');

        self.setupSocketIo();

        self.setupDatabase(function (data) {
            log.dbg('Database setup complete ..');

            global.installed = data.installed;

            if (data.installed) {
                vdr.host = data.vdrHost;
                vdr.restfulPort = data.restfulPort;
                vdr.restful = 'http://' + vdr.host + ':' + data.restfulPort;

                self.setupLogos();
                self.setupControllers();
                self.setupViews();

                self.setupVdr();
            } else {
                self.setupControllers();
                self.setupViews();
            }
        });
    });
}

Bootstrap.prototype.setupExpress = function (cb) {
    var SessionMongoose = require("session-mongoose");
    global.mongooseSessionStore = new SessionMongoose({
        url: "mongodb://127.0.0.1/GUIAsession"
    });

    this.app.use(this.express.bodyParser());
    this.app.use(this.express.cookieParser());
    this.app.use(this.logging.requestLogger);
    this.app.use(this.express.session({
        store: mongooseSessionStore,
        secret: '4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a',
        key: 'guia.id',
        cookie: {
            maxAge: 60000 * 60 * 24
        }
    }));

    this.app.use(i18n.init);

    i18n.configure({
        // setup some locales - other locales default to en silently
        locales:['en', 'de'],

        // where to register __() and __n() to, might be "global" if you know what you are doing
        register: global
    });

    global.rest = rest;

    global.vdr = {
        host: null,
        restful: null,
        plugins: {}
    };

    global.log = this.logging;

    /*
     * Set public directory for directly serving files
     */
    this.app.use(this.express.static(__dirname + '/lib/js'));
    this.app.use(this.express.static(__dirname + '/share/www'));

    this.app.use(this.express.favicon(__dirname + '/share/www/img/favicon.ico'));
    this.app.use(this.express.errorHandler({dumpExceptions: true, showStack: true}));

    /*
     * Register Template engine with .html and .js
     */
    this.app.register('.html', require('ejs'));
    this.app.register('.js', require('ejs'));

    /*
     * Register view directory
     */
    this.app.set('views', __dirname + '/html');
    this.app.set('view engine', 'html');

    /*
     * Create browserify array for included modules to web interface
     */
    //var browserify = new Array();

    /*fs.readdirSync(__dirname + '/models').forEach(function (file) {
        browserify.push(__dirname + '/models/' + file);
    });*/

    //browserify.push('node-uuid');

    /*
     * Use browserify in our express app
     */
    /*this.app.use(require('browserify')({
        require: browserify,
        mount: '/browserify.js',
        filter: require('uglify-js')
    }));*/

    cb.call();
};

Bootstrap.prototype.setupDatabase = function (cb) {
    global.mongoose = require('mongoose');
    global.Schema = mongoose.Schema;

    log.dbg('Connect to database ..');

    mongoose.connect('mongodb://127.0.0.1/GUIA');
    mongoose.connection.on('error', function (e) {
        throw e;
    });

    mongoose.connection.on('open', function () {
        var schemas = fs.readdirSync(__dirname + '/schemas');

        schemas.forEach(function (schema) {
            schema = schema.replace('.js', '');
            require(__dirname + '/schemas/' + schema);
        });

        var ConfigurationSchema = mongoose.model('Configuration');

        ConfigurationSchema.count({}, function (err, cnt) {
            if (cnt == 0) {
                log.dbg('Not installed! Delivering installation');

                require(__dirname + '/controllers/InstallController');

                cb.apply(this, [{
                    installed: false
                }]);
            } else {
                log.dbg('GUIA installed! Getting configuration ..');

                ConfigurationSchema.findOne({}, function (err, data) {
                    global.guia = data;

                    cb.apply(this, [{
                        installed: true,
                        vdrHost: data.vdrHost,
                        restfulPort: data.restfulPort
                    }]);
                });
            }
        });
    });
};

Bootstrap.prototype.setupSocketIo = function () {
    /*
     * Create socket
     */
    log.dbg('Setting up socket.io ..');

    global.io = require('socket.io').listen(this.app);

    var parseCookie = require('express/node_modules/connect').utils.parseCookie;
    var Session = require('express/node_modules/connect').middleware.session.Session;

    io.configure(function (){
        io.set('transports', ['websocket']);

        io.set('authorization', function (data, accept) {
            if (data.headers.cookie) {
                data.cookie = parseCookie(data.headers.cookie);
                data.sessionID = data.cookie['guia.id'];

                // save the session store to the data object
                // (as required by the Session constructor)

                data.sessionStore = mongooseSessionStore;
                mongooseSessionStore.get(data.sessionID, function (err, session) {
                    if (err) {
                        accept(err.message, false);
                    } else {
                        // create a session object, passing data as request and our
                        // just acquired session data
                        data.session = new Session(data, session);
                        accept(null, true);
                    }
                });
            } else {
                return accept('No cookie transmitted.', false);
            }
        });
    });
};

Bootstrap.prototype.setupViews = function () {
    var ConfigurationSchema = mongoose.model('Configuration');
    log.dbg('Setting up views ..');

    this.app.all('*', function (req, res, next) {
        log.dbg('Incoming request ..');

        if (!installed && !req.url.match(/^\/templates\/install/)) {
            log.dbg('serving installation ..');
            res.render('install', {
                layout: false
            });
        } else {
            log.dbg('Process request ..');

            mongooseSessionStore.get(req.sessionID, function (err, session) {
                if (session == null) {
                    log.dbg('Not loggedin ..');
                } else {
                    log.dbg('Loggedin ..');
                    req.session.loggedIn = session.loggedIn;
                }

                next();
            });
        }
    });

    this.app.get('/', function (req, res) {
        log.dbg('Render index.html ..');

        ConfigurationSchema.findOne({}, function (err, data) {
            res.render('index', {
                layout: false,
                isLoggedIn: req.session.loggedIn,
                vdr: JSON.stringify(vdr.plugins),
                guia: JSON.stringify(data)
            });
        });
    });

    var self = this;

    fs.readdir(__dirname + '/views', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            file = file.replace('.js', '');

            var view = require(__dirname + '/views/' + file);

            self.app.get(view.url, view.func);
        });
    });
};

Bootstrap.prototype.setupControllers = function () {
    log.dbg('Setting up controllers ..');

    fs.readdir(__dirname + '/controllers', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            file = file.replace('.js', '');

            if (file != 'InstallController') {
                require('./controllers/' + file);
            }
        });
    });
};

Bootstrap.prototype.setupLogos = function () {
    var LogoSchema = mongoose.model('Logo');
    log.dbg('Setting up logos ..');

    LogoSchema.find({}, function (err, data) {
        data.forEach(function (logo) {
            try {
                fs.lstatSync(__dirname + '/share/logos/' + logo.file);
            } catch (e) {
                logo.remove();
            }
        });
    });

    fs.readdir(__dirname + '/share/logos', function (err, files) {
        if (err) throw err;

        files.forEach(function (logo) {
            logo = logo.replace(/\//, '|');

            if (logo.match(/.png$/)) {
                var logoModel = new LogoSchema({
                    file: logo,
                    name: logo.replace('.png', '')
                });

                logoModel.save();
            }
        });

        log.dbg('done');
    });
};

Bootstrap.prototype.setupVdr = function () {
    var self = this;

    rest.get(vdr.restful + '/info.json').on('success', function(data) {
        vdr.plugins.epgsearch = false;

        for (var i in data.vdr.plugins) {
            vdr.plugins[data.vdr.plugins[i].name] = true;
        }

        self.setupEpgImport(vdr.restful, global.mongoose);
    }).on('error', function () {
        log.bad('VDR is not running .. retrying in 5 Minutes');
        log.dbg(JSON.stringify(vdr), true);

        setTimeout(function () {
            self.setupVdr();
        }, 300000);
    });
};

Bootstrap.prototype.setupEpgImport = function (restful) {
    var config = mongoose.model('Configuration');
    var EpgImport = require('./lib/Epg/Import');
    var ActorDetails = require('./lib/Actor');
    var MovieDetails = require('./lib/Movie');
    var SeasonDetails = require('./lib/Season');
    var importer = new EpgImport(vdr.restful, 250);

    function runImporter () {
        importer.start(function (hadEpg) {
            if (hadEpg) {
                runImporter();
                return;
            } else {
                config.findOne({}, function (err, doc) {
                    if (doc.epgscandelay === undefined) {
                        log.dbg('Delayed new epg scan .. starting in one hour');

                        setTimeout(function () {
                            runImporter();
                        }, 1000 * 60 * 60);
                    } else {
                        log.dbg('Delayed new epg scan .. starting in ' + doc.epgscandelay + ' hours');
                        setTimeout(function () {
                            runImporter();
                        }, (1000 * 60 * 60) * doc.epgscandelay);
                    }
                });
            }

            var ConfigurationSchema = mongoose.model('Configuration');

            ConfigurationSchema.findOne({}, function (err, data) {
                if (data.get('fetchTmdbActors')) {
                    var actorDetails = new ActorDetails();
                    actorDetails.fetchAll();
                } else {
                    log.inf('Tmdb Actors fetching disabled ..');
                }

                if (data.get('fetchTmdbMovies')) {
                    var movieDetails = new MovieDetails();
                    movieDetails.fetchAll();
                } else {
                    log.inf('Tmdb Movies fetching disabled ..');
                }
            });
        });
    }

    runImporter();
};

module.exports = Bootstrap;