var fs = require("fs");
var i18n = require('i18n');
var rest = require('restler');
var uuid = require('node-uuid');
var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    this.logging = require('node-logging');

    var self = this;

    global.io = require('socket.io').listen(this.app);
    self.setupSocketIo();

    this.setup(function () {
        self.setupControllers();
        self.setupViews();
    });
}

Bootstrap.prototype.setup = function (callback) {
    var self = this;

    this.setupExpress(function () {
        log.dbg('Express setup complete ..');

        self.setupDatabase(function (data) {
            log.dbg('Database setup complete ..');

            global.installed = data.installed;

            if (data.installed) {
                vdr.host = data.vdrHost;
                vdr.restfulPort = data.restfulPort;
                vdr.restful = 'http://' + vdr.host + ':' + data.restfulPort;

                self.setupLogos();
                self.setupVdr();
            }

            if (callback !== undefined) {
                callback();
            }
        });
    });
};

Bootstrap.prototype.setupExpress = function (cb) {
    var app = this.app;
    var express = this.express;
    var logging = this.logging;
    var self = this;

    var SessionMongoose = require("session-mongoose");
    global.mongooseSessionStore = new SessionMongoose({
        url: "mongodb://127.0.0.1/GUIAsession"
    });

    app.configure(function () {
        self.env = 'production';

        app.use(express.bodyParser());
        app.use(express.cookieParser());

        app.use(express.session({
            store: mongooseSessionStore,
            secret: '4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a',
            key: 'guia.id',
            cookie: {
                maxAge: 60000 * 60 * 24
            }
        }));

        app.use(i18n.init);

        i18n.configure({
            directory: __dirname + '/share/locales',
            // setup some locales - other locales default to en silently
            locales:['en', 'de'],

            // where to register __() and __n() to, might be "global" if you know what you are doing
            register: global
        });

        app.use(express.favicon(__dirname + '/share/www/icons/favicon.ico'));

        /*
         * Register Template engine with .html and .js
         */
        app.register('.html', require('ejs'));
        app.register('.js', require('ejs'));

        /*
         * Register view directory
         */
        app.set('views', __dirname + '/html');
        app.set('view engine', 'html');
    });

    app.configure('development', function () {
        self.env = 'developement';
        logging.setLevel('debug');

        app.use(express.static(__dirname + '/share/www'));
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
        app.use(logging.requestLogger);
    });

    app.configure('production', function () {
        logging.setLevel('error');

        var assets = {
            js: {
                route: /\/app.js/,
                path: __dirname + '/share/www/js/',
                dataType: 'javascript',
                files: [
                    'jquery-plugins/blinky.js',
                    'jquery-plugins/bootstrap-buttons.js',
                    'jquery-plugins/bootstrap-modal.js',
                    'jquery-plugins/bootstrap-twipsy.js',
                    'jquery-plugins/bootstrap-popover.js',
                    'jquery-plugins/bootstrap-scrollspy.js',
                    'jquery-plugins/bootstrap-tabs.js',
                    'jquery-plugins/jquery.fancybox.js',
                    'jquery-plugins/spin.min.js',
                    'models/ChannelModel.js',
                    'models/ConfigurationModel.js',
                    'models/EventModel.js',
                    'models/LogoModel.js',
                    'models/NavigationModel.js',
                    'models/RawEventModel.js',
                    'models/RecordingModel.js',
                    'models/SearchresultModel.js',
                    'models/SearchtimerModel.js',
                    'models/TimerModel.js',
                    'models/TVGuideModel.js',
                    'utils/sha512.js',
                    'utils/xdate.js',
                    'collections/ChannelCollection.js',
                    'collections/EventCollection.js',
                    'collections/LogoCollection.js',
                    'collections/NavigationCollection.js',
                    'collections/RecordingCollection.js',
                    'collections/SearchresultCollection.js',
                    'collections/SearchtimerCollection.js',
                    'collections/TimerCollection.js',
                    'collections/TVGuideCollection.js',
                    'views/AboutView.js',
                    'views/ContactView.js',
                    'views/EventView.js',
                    'views/HelpView.js',
                    'views/LogoutView.js',
                    'views/NavigationView.js',
                    'views/ProfileView.js',
                    'views/RecordingsView.js',
                    'views/SearchView.js',
                    'views/SettingsView.js',
                    'views/TVGuideView.js',
                    'views/WelcomeView.js',
                    'views/Channel/Select/DialogView.js',
                    'views/Help/ShortcutsView.js',
                    'views/Settings/ChannelsView.js',
                    'views/Settings/DatabaseView.js',
                    'views/Settings/GuiaView.js',
                    'views/TVGuide/ChannelView.js',
                    'views/TVGuide/EventView.js',
                    'views/TVGuide/PaginationView.js',
                    'bootstrap.js',
                    'Application.js'
                ],
                postManipulate: {
                    '^': [
                        //assetHandler.uglifyJsOptimize
                    ]
                }
            }
        };

        var assetsManagerMiddleware = assetManager(assets);

        app.use(express.static(__dirname + '/share/www'));
        app.use(assetsManagerMiddleware);
    });

    global.rest = rest;

    global.vdr = {
        host: null,
        restful: null,
        plugins: {}
    };

    global.log = this.logging;



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
};

Bootstrap.prototype.setupSocketIo = function () {
    var self = this;

    var parseCookie = require('express/node_modules/connect').utils.parseCookie;
    var Session = require('express/node_modules/connect').middleware.session.Session;

    io.configure(function (){
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

    io.configure('production', function(){
        io.set('log level', 1);

        io.set('transports', [
            'websocket'
            , 'flashsocket'
            , 'htmlfile'
            , 'xhr-polling'
            , 'jsonp-polling'
        ]);

        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
    });

    io.configure('development', function(){
        io.set('transports', ['websocket']);
    });
};

Bootstrap.prototype.setupViews = function () {
    var ConfigurationSchema = mongoose.model('Configuration');
    log.dbg('Setting up views ..');

    this.app.all('*', function (req, res, next) {
        if (!installed && !req.url.match(/^\/templates\/install/)) {
            log.dbg('serving installation ..');
            res.render('install', {
                layout: false,
                socializeKey: uuid.v4()
            });
        } else {
            mongooseSessionStore.get(req.sessionID, function (err, session) {
                if (session != null) {
                    req.session.loggedIn = session.loggedIn;
                }

                next();
            });
        }
    });

    var self = this;

    fs.readdir(__dirname + '/views', function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            file = file.replace('.js', '');

            var view = require(__dirname + '/views/' + file);

            self.app.get(view.url, view.func);
        });

        self.app.get('*', function (req, res) {
            ConfigurationSchema.findOne({}, function (err, data) {
                res.render('index', {
                    layout: false,
                    isLoggedIn: req.session.loggedIn,
                    vdr: JSON.stringify(vdr.plugins),
                    guia: JSON.stringify(data),
                    env: self.env
                });
            });
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
        self.setupTimer(vdr.restful);
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
    var importer = new EpgImport(restful, 250);

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

Bootstrap.prototype.setupTimer = function (restful) {
    var self = this;
    var EpgTimer = require('./lib/Epg/Timer');
    var timerSetup = new EpgTimer(restful);

    timerSetup.refresh();
    log.dbg('Delayed new timer scan .. starting in 5 minutes');

    setTimeout(function () {
        self.setupTimer(restful);
    }, 1000 * 60 * 5);
};

module.exports = Bootstrap;