var async = require('async'),
    fs = require('fs'),
    logging = require('node-logging'),
    socketIo = require('socket.io'),
    mime = require('mime'),
    Mongoose = require("session-mongoose"),
    walk = require('walk');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    this.log = logging;

    var _this = this;

    this.frontend = {
        files: []
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

        this.register('.html', require('ejs'));
        this.register('.js', require('ejs'));

        this.set('views', __dirname + '/application/frontend/html');
        this.set('view engine', 'html');

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

            if (!config.active) {
                cb(null);
                return;
            }

            walker = walk.walk(pluginDir + '/' + plugin + '/public', {
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
                var dir = root.replace(pluginDir + '/' + plugin + '/public/', '');

                fs.readFile(root + '/' + fileStats.name, function (err, file) {
                    type = mime.lookup(root + '/' + fileStats.name);

                    _this.frontend.files.push({type: type, file: '/' + plugin + '/' + dir + '/' + fileStats.name});
                    _this.app.get('/' + plugin + '/' + dir + '/' + fileStats.name, function (req, res) {


                        if (!res.getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
                        if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (0 / 1000));
                        if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
                        if (!res.getHeader('Content-Type')) {
                            var charset = mime.charsets.lookup(type);
                            res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
                        }

                        res.setHeader('Content-Length', fileStats.size);
                        res.end(file.toString());
                    });

                    next();
                });
            });

            walker.on("errors", function (root, nodeStatsArray, next) {
                next();
            });

            walker.on("end", function () {
                cb(null);
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
    this.app.get('*', function (req, res) {
        res.render('index', {
            layout: false,
            locale: req.locale
        });
    });

    console.log(this.frontend.files);

    cb(null);
};

module.exports = Bootstrap;