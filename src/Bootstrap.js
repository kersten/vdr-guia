var async = require('async'),
    fs = require('fs'),
    i18next = require('i18next'),
    logging = require('node-logging'),
    socketIo = require('socket.io'),
    mime = require('mime'),
    MongooseSession = require("session-mongoose"),
    Mongoose = require('mongoose'),
    Plugin = require('./lib/Plugin'),
    walk = require('walk');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    this.log = logging;

    var _this = this;

    this.frontend = {
        files: [],
        routes: [],
        locales: ['ns.app'],
        templates: []
    };

    async.series([
        function (cb) {
            _this.initMongoose(cb);
        }, function (cb) {
            _this.initExpress(cb);
        }, function (cb) {
            _this.initSocketIO(cb);
        }, function (cb) {
            _this.initBackendPlugins(cb);
        }, function (cb) {
            _this.initFrontendPlugins(cb);
        }, function (cb) {
            _this.initFrontend(cb);
        }
    ], function () {
        _this.log.inf('GUIA ready');
    });
    /*self.setupSocketIo();

    var Navigation = require('./lib/Navigation');

    this.navigation = new Navigation();

    this.setup(function () {
        self.setupControllers();
        self.setupViews();
        self.setupPlugins();

        i18next.registerAppHelper(app);
        i18next.serveClientScript(app);
        i18next.serveDynamicResources(app);
        i18next.serveMissingKeyRoute(app);
    });*/
}

Bootstrap.prototype.initMongoose = function (cb) {
    this.sessionStore = new MongooseSession({
        url: "mongodb://127.0.0.1/GUIAsession"
    });

    this.mongoose = Mongoose;

    this.mongoose.connect('mongodb://127.0.0.1/GUIA');
    this.mongoose.connection.on('error', function (e) {
        throw e;
    });

    var schemas = fs.readdirSync(__dirname + '/schemas');

    schemas.forEach(function (schema) {
        schema = schema.replace('.js', '');
        require(__dirname + '/schemas/' + schema);
    });

    cb(null);
};

Bootstrap.prototype.initExpress = function (cb) {
    var _this = this;

    this.app.configure(function () {
        this.use(_this.express.bodyParser());
        this.use(_this.express.cookieParser());

        this.use(_this.express.session({
            store: _this.sessionStore,
            secret: '4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a',
            key: 'guia.id',
            cookie: {
                maxAge: 60000 * 60 * 24
            }
        }));

        this.use(_this.express.static(__dirname + '/application/frontend/public'));

        this.register('.html', require('ejs'));
        this.register('.js', require('ejs'));
        
        this.register('.haml', require('haml'));

        this.set('views', __dirname + '/application/frontend/html');
        this.set('view engine', 'html');

        this.use(i18next.handle);

        cb(null);
    });
};

Bootstrap.prototype.initSocketIO = function (cb) {
    var _this = this;

    var parseCookie = require('express/node_modules/connect').utils.parseCookie;
    var Session = require('express/node_modules/connect').middleware.session.Session;

    this.io = socketIo.listen(this.app);

    this.io.configure(function () {
        this.set('authorization', function (data, accept) {
            if (data.headers.cookie) {
                data.cookie = parseCookie(data.headers.cookie);
                data.sessionID = data.cookie['guia.id'];

                // save the session store to the data object
                // (as required by the Session constructor)

                data.sessionStore = _this.sessionStore;
                _this.sessionStore.get(data.sessionID, function (err, session) {
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

    this.io.configure('production', function(){
        this.set('log level', 1);

        this.set('transports', [
            'websocket'
            , 'flashsocket'
            , 'htmlfile'
            , 'xhr-polling'
            , 'jsonp-polling'
        ]);

        this.enable('browser client minification');
        this.enable('browser client etag');
        this.enable('browser client gzip');
    });

    this.io.configure('development', function(){
        this.set('transports', ['websocket']);
    });

    cb(null);
};

Bootstrap.prototype.initBackendPlugins = function (cb) {
    var _this = this;

    var pluginDir = __dirname + '/application/backend/plugins';

    this.log.inf('Setting up backend plugins');

    async.map(fs.readdirSync(pluginDir), function (plugin, cb) {
        _this.log.dbg('Setting up plugin: ' + plugin);
        var plg = require(pluginDir + '/' + plugin);

        if (plg.listener) {
            _this.io.sockets.on('connection', function (socket) {
                for (var listener in plg.listener) {
                    _this.log.dbg('Register socket listener: ' + plugin + ':' + listener);

                    socket.on(plugin + ':' + listener, plg.listener[listener]);
                }
            });
        }

        if (plg.routes) {
            for (var route in plg.routes) {
                _this.app.get(route, plg.routes[route]);
            }
        }

        cb(null);
    }, function () {
        cb(null);
    });
};

Bootstrap.prototype.initFrontendPlugins = function (cb) {
    var _this = this;

    var pluginDir = __dirname + '/application/frontend/plugins';

    this.log.inf('Setting up frontend plugins');

    async.map(fs.readdirSync(pluginDir), function (plugin, cb) {
        _this.log.dbg('Setting up plugin: ' + plugin);

        fs.readFile(pluginDir + '/' + plugin + '/plugin.json', 'utf-8', function(err, config) {
            if (err) {
                _this.log.err('plugin.json file does not exists for plugin: ' + plugin);
                cb(null);
                return;
            }

            config = JSON.parse(config);
            config.pluginDir = pluginDir;

            if (!config.active) {
                cb(null);
                return;
            }

            async.parallel([
                function (cb) {
                    walker = walk.walk(pluginDir + '/' + plugin + '/locales', {
                        followLinks: false
                    });

                    walker.on("names", function (root, nodeNamesArray) {
                        nodeNamesArray.sort(function (a, b) {
                            if (a > b) return 1;
                            if (a < b) return -1;
                            return 0;
                        });
                    });

                    walker.on("file", function (root, fileStats, next) {
                        var dir = root.replace(pluginDir + '/' + plugin + '/locales/', '');

                        try {
                            fs.mkdirSync(__dirname + '/locales/' + dir);
                        } catch (e) {}

                        try {
                            fs.symlinkSync('../..' + root.replace(__dirname, '') + '/' + fileStats.name, __dirname + '/locales/' + dir + '/' + fileStats.name);
                        } catch (e) {}

                        _this.frontend.locales.push(fileStats.name.replace('.json', ''));

                        next();
                    });

                    walker.on("errors", function (root, nodeStatsArray, next) {
                        next();
                    });

                    walker.on("end", function () {
                        cb(null);
                    });
                }, function (cb) {
                    walker = walk.walk(pluginDir + '/' + plugin + '/templates', {
                        followLinks: false
                    });

                    walker.on("names", function (root, nodeNamesArray) {
                        nodeNamesArray.sort(function (a, b) {
                            if (a > b) return 1;
                            if (a < b) return -1;
                            return 0;
                        });
                    });

                    walker.on("file", function (root, fileStats, next) {
                        var dir = root.replace(pluginDir + '/' + plugin + '/templates', '');

                        var path = dir.split('/');
                        path.push(fileStats.name.replace('index.html', '').replace('.html', '').replace('.haml', ''));
                        var id = plugin + path.join('');

                        _this.frontend.templates.push({
                            id: id + 'Template',
                            src: root + '/' + fileStats.name.replace('index.html', '').replace('.html', '')
                        });
                        next();
                    });

                    walker.on("errors", function (root, nodeStatsArray, next) {
                        next();
                    });

                    walker.on("end", function () {
                        cb(null);
                    });
                }
            ], function () {
                var plug = new Plugin(plugin, config, _this.app);
                plug.init(function (config) {
                    if (config.publicFiles) _this.frontend.files = _this.frontend.files.concat(config.publicFiles);
                    if (config.routes) _this.frontend.routes = _this.frontend.routes.concat(config.routes);

                    cb(null);
                });
            });
        });
    }, function () {
        cb(null);
    });
};

Bootstrap.prototype.initFrontend = function (cb) {
    var _this = this;

    i18next.init({
        ns: { namespaces: _this.frontend.locales, defaultNs: 'ns.app'},
        resSetPath: __dirname + '/locales/__lng__/__ns__.json',
        resGetPath: __dirname + '/locales/__lng__/__ns__.json',
        fallbackLng: 'en-US',
        saveMissing: true
    });

    i18next.registerAppHelper(this.app);
    i18next.serveClientScript(this.app);
    i18next.serveDynamicResources(this.app);
    i18next.serveMissingKeyRoute(this.app);

    this.app.get('*', function (req, res) {
        res.render('index', {
            layout: false,
            locale: req.locale,
            locales: _this.frontend.locales,
            templates: _this.frontend.templates,
            files: _this.frontend.files,
            routes: _this.frontend.routes
        });
    });

    cb(null);
};

module.exports = Bootstrap;