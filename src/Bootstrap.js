var async = require('async'),
    fs = require('fs'),
    i18next = require('i18next'),
    logging = require('node-logging'),
    socketIo = require('socket.io'),
    Mongoose = require("session-mongoose"),
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
        locales: ['ns.app']
    };

    async.series([
        function (cb) {
            _this.initMongoose(cb);
        }, function (cb) {
            _this.initExpress(cb);
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

    global.io = socketIo.listen(this.app);
    /*self.setupSocketIo();

    var Navigation = require('./lib/Navigation');

    this.navigation = new Navigation();

    i18next.init({
        ns: { namespaces: ['ns.app', 'ns.plugin.yavdr'], defaultNs: 'ns.app'},
        resSetPath: __dirname + '/locales/__lng__/__ns__.json',
        resGetPath: __dirname + '/locales/__lng__/__ns__.json',
        saveMissing: true
    });

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
    this.sessionStore = new Mongoose({
        url: "mongodb://127.0.0.1/GUIAsession"
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

        this.set('views', __dirname + '/application/frontend/html');
        this.set('view engine', 'html');

        this.use(i18next.handle);

        cb(null);
    });
};

Bootstrap.prototype.initBackendPlugins = function (cb) {
    this.log.inf('Setting up backend plugins');

    cb(null);
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

            var plug = new Plugin(plugin, config, _this.app);
            plug.init(function (config) {
                if (config.publicFiles) _this.frontend.files = _this.frontend.files.concat(config.publicFiles);
                if (config.routes) _this.frontend.routes = _this.frontend.routes.concat(config.routes);

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
                        fs.linkSync(root + '/' + fileStats.name, __dirname + '/locales/' + dir + '/' + fileStats.name);
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
            });
        });
    }, function () {
        cb(null);
    });
        /*plugins.forEach(function (plugin) {
            _this.log.inf('Setting up plugin: ' + plugin);

            fs.readFile(__dirname + '/application/frontend/plugins/' + plugin + '/plugin.json', 'utf-8', function(err, config) {
                if (err) {
                    _this.log.err('plugin.json file does not exists for plugin: ' + plugin);
                    return;
                }

                config = JSON.parse(config);

                if (!config.active) {
                    return;
                }

                if (config.mainMenu) {
                    _this.log.inf(JSON.stringify(GUIA.navigation));
                    self.navigation.addItem(config.mainMenu, config.needslogin);
                }

                var Plugin = require(__dirname + '/application/frontend/plugins/' + plugin);
                var plg = new Plugin(self.app, self.express);
                plg.init();
            });
        });
    });*/
};

Bootstrap.prototype.initFrontend = function (cb) {
    var _this = this;

    i18next.init({
        ns: { namespaces: _this.frontend.locales, defaultNs: 'ns.app'},
        resSetPath: __dirname + '/locales/__lng__/__ns__.json',
        resGetPath: __dirname + '/locales/__lng__/__ns__.json',
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
            files: _this.frontend.files,
            routes: _this.frontend.routes
        });
    });

    cb(null);
};

module.exports = Bootstrap;