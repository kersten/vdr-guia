var fs = require("fs");
var i18n = require('i18n');
var rest = require('restler');
var uuid = require('node-uuid');
var async = require('async');
var file = require('file');
global.Dnode = require('dnode');

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

                self.setupDnode(function () {
                    self.setupLogos();
                    self.setupVdr();
                });
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

        app.use(express.static(__dirname + '/share/www'));
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

        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
        app.use(logging.requestLogger);
    });

    app.configure('production', function () {
        logging.setLevel('info');
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
    var self = this;

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

                if (data.get('dbversion') != '0.1') {
                    async.parallel([
                        function (callback) {
                            var events = mongoose.model('Event');
                            events.find({}, function (err, docs) {
                                async.map(docs, function (doc, callback) {
                                    doc.remove(function () {
                                        callback(null, null);
                                    });
                                }, function () {
                                    callback(null, null);
                                });
                            });
                        }, function (callback) {
                            var actors = mongoose.model('Actor');
                            actors.find({}, function (err, docs) {
                                async.map(docs, function (doc, callback) {
                                    doc.remove(function () {
                                        callback(null, null);
                                    });
                                }, function () {
                                    callback(null, null);
                                });
                            });
                        }, function (callback) {
                            var actorDetails = mongoose.model('ActorDetail');
                            actorDetails.find({}, function (err, docs) {
                                async.map(docs, function (doc, callback) {
                                    doc.remove(function () {
                                        callback(null, null);
                                    });
                                }, function () {
                                    callback(null, null);
                                });
                            });
                        }, function (callback) {
                            var movieDetails = mongoose.model('MovieDetail');
                            movieDetails.find({}, function (err, docs) {
                                async.map(docs, function (doc, callback) {
                                    doc.remove(function () {
                                        callback(null, null);
                                    });
                                }, function () {
                                    callback(null, null);
                                });
                            });
                        }, function (callback) {
                            data.set({dbversion: '0.1'});
                            data.save(function () {
                                callback(null, null);
                            });
                        }], function () {
                            mongoose.disconnect();
                            self.setupDatabase(cb);
                        }
                    );

                    return;
                }

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

Bootstrap.prototype.setupDnode = function (callback) {
    var self = this;
    var config = mongoose.model('Configuration');

    config.findOne({}, function (err, doc) {
        global.socialize = (doc.get('socializeKey') != null) ? true : false;

        if (socialize === true) {
            log.dbg('Setting up dnode ..');

            var client = Dnode();

            client.connect({
                host: 'guia-server.yavdr.tv',
                port: 7007,
                reconnect: 600
            }, function (remote, connection) {
                remote.authenticateVdr(doc.get('socializeKey'), function (session) {
                    log.dbg('Dnode  connected ..');
                    
                    if (session) {
                        log.dbg('Dnode authenticated ..');
                        global.dnodeVdr = session;

                        if (!self.dnodeReconnect) {
                            self.dnodeReconnect = true;
                            callback();
                        } else {
                            log.dbg('Dnode reconnected');
                        }
                    }
                });
            });
        } else {
            callback();
        }
    });
};

Bootstrap.prototype.setupViews = function () {
    var ConfigurationSchema = mongoose.model('Configuration');
    log.dbg('Setting up views ..');

    var templates = new Array();
    var jsFiles = new Array();

    file.walkSync(__dirname + '/html/templates', function (path, subDirs, files) {
        if (!path.match('Install')) {
            files.forEach(function (file) {
                if (file.match(/^\./)) {
                    return;
                }

                file = file.replace('.html', '');

                var template = path + '/' + file;
                var templateId = template.replace(__dirname + '/html/templates', '').replace(/\//g, '');

                log.dbg('Select template: ' + template + ' :: ' + templateId);
                templates.push({
                    id: templateId.replace(/index$/, ''),
                    path: path + '/' + file
                });
            });
        }
    });

    jsFiles.push('/js/jquery/jquery-1.7.js');

    jsFiles.push('/js/jquery-plugins/blinky.js');
    jsFiles.push('/js/jquery-plugins/bootstrap.js');
    jsFiles.push('/js/jquery-plugins/jquery.endless-scroll.js');
    jsFiles.push('/js/jquery-plugins/jquery.fancybox.js');
    jsFiles.push('/js/jquery-plugins/lionbars.min.js');
    jsFiles.push('/js/jquery-plugins/mousewheel.js');
    jsFiles.push('/js/jquery-plugins/spin.min.js');

    jsFiles.push('/js/backbone/underscore.js');
    jsFiles.push('/js/backbone/backbone.js');

    var walkThroughJs = new Array(
        __dirname + '/share/www/js/utils',
        __dirname + '/share/www/js/models',
        __dirname + '/share/www/js/collections',
        __dirname + '/share/www/js/views'
    );

    walkThroughJs.forEach(function (dir) {
        file.walkSync(dir, function (path, subDirs, files) {
            if (!path.match('Install')) {
                if (path.match('js/backbone') || path.match('js/jquery-plugins')) {
                    files = files.reverse();
                }

                files.forEach(function (jsFile) {
                    if (jsFile.match(/^\./)) {
                        return;
                    }

                    jsFile = (path + '/' + jsFile).replace(__dirname + '/share/www', '');

                    log.dbg('Select js: ' + jsFile);
                    jsFiles.push(jsFile);
                });
            }
        });
    });

    jsFiles.push('/socket.io/socket.io.js');
    jsFiles.push('/js/async.js');
    jsFiles.push('/js/bootstrap.js');
    jsFiles.push('/js/Application.js');

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
                    env: self.env,
                    templates: templates,
                    jsFiles: jsFiles
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
    var self = this;

    var config = mongoose.model('Configuration');
    var EpgImport = require('./lib/Epg/Import');
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

                self.setupExtendedDetails();
            }
        });
    }

    runImporter();
};

Bootstrap.prototype.setupExtendedDetails = function () {
    if (this.extendedDetailsRunning === true) {
        return;
    }

    this.extendedDetailsRunning = true;

    var self = this;
    var config = mongoose.model('Configuration');
    var Channel = require('./lib/Channel');
    var ActorDetails = require('./lib/Actor');
    var MovieDetails = require('./lib/Movie');
    var SeasonDetails = require('./lib/Season');
    var EpgImport = require('./lib/Epg/Import');
    var importer = new EpgImport();

    var ConfigurationSchema = mongoose.model('Configuration');
    
    var channels = new Channel();
    channels.import(function () {
        ConfigurationSchema.findOne({}, function (err, data) {
            async.parallel([function (callback) {
                importer.evaluateType(function () {
                    if (data.get('fetchThetvdbSeasons')) {
                        log.inf('Thetvdb Seasons fetching started ..');
    
                        var seasonDetails = new SeasonDetails();
                        seasonDetails.fetchAll(function () {
                            log.inf('Thetvdb Seasons fetching finished ..');
                            callback(null, null);
                        });
                    } else {
                        log.inf('Thetvdb Seasons fetching disabled ..');
                        callback(null, null);
                    }
                });
            }, function (callback) {
                callback(null, null);
                /*if (data.get('fetchTmdbMovies')) {
                    log.inf('Tmdb Movies fetching started ..');
    
                    var movieDetails = new MovieDetails();
                    movieDetails.fetchAll(function () {
                        log.inf('Tmdb Movies fetching finished ..');
                        callback(null, null);
                    });
                } else {
                    log.inf('Tmdb Movies fetching disabled ..');
                    callback(null, null);
                }*/
            }, function (callback) {
                callback(null, null);
                /*if (data.get('fetchTmdbActors')) {
                    log.inf('Tmdb Actors fetching started ..');
    
                    var actorDetails = new ActorDetails();
                    actorDetails.fetchAll(function () {
                        log.inf('Tmdb Actors fetching finished ..');
                        callback(null, null);
                    });
                } else {
                    log.inf('Tmdb Actors fetching disabled ..');
                    callback(null, null);
                }*/
            }], function (err, result) {
                log.inf('Extended details fetching finished ..');
                self.extendedDetailsRunning = false;
            });
        });
    });
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