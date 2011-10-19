var fs = require("fs");
var i18n = require('i18n');
var rest = require('restler');
var LogoCollection = require('./models/LogoCollection');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    
    var self = this;
    
    this.setupExpress(function () {
        console.log('Express setup complete ..');
        
        self.setupSocketIo();
        
        self.setupDatabase(function (data) {
            console.log('Database setup complete ..');
            
            global.installed = data.installed;
            
            if (data.installed) {
                self.setupLogos();
                
                vdr.host = data.vdrHost;
                vdr.restful = 'http://' + vdr.host + ':' + data.restfulPort;
                
                rest.get(vdr.restful + '/info.json').on('success', function(data) {
                    vdr.plugins.epgsearch = false;

                    for (var i in data.vdr.plugins) {
                        vdr.plugins[data.vdr.plugins[i].name] = true;
                    }

                    self.setupControllers();
                    self.setupViews();
                }).on('error', function () {
                    console.log('ERROR');
                    console.log(vdr);
                });
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
        url: "mongodb://localhost/GUIAsession"
    });
    
    this.app.use(this.express.bodyParser());
    this.app.use(this.express.cookieParser());
    
    this.app.use(this.express.session({
        store: mongooseSessionStore,
        secret: '4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a',
        key: 'guia.id',
        cookie: {maxAge: 60000 * 60 * 24}
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
    
    /*
     * Set public directory for directly serving files
     */
    this.app.use(this.express.static(__dirname + '/lib/public'));
    
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
    var browserify = new Array();

    fs.readdirSync(__dirname + '/models').forEach(function (file) {
        browserify.push(__dirname + '/models/' + file);
    });

    browserify.push('jquery-browserify', 'backbone-browserify', 'node-uuid');

    /*
     * Use browserify in our express app
     */
    this.app.use(require('browserify')({
        require: browserify,
        mount: '/browserify.js'
        //filter: require('uglify-js')
    }));
    
    cb.call();
};

Bootstrap.prototype.setupDatabase = function (cb) {
    global.mongoose = require('mongoose');
    global.Schema = mongoose.Schema;
    
    mongoose.connect('mongodb://localhost/GUIA');
    
    var ConfigurationModel = require('./dbmodels/ConfigurationModel');
    
    ConfigurationModel.count({}, function (err, cnt) {
        if (cnt == 0) {
            require(__dirname + '/controllers/InstallController');

            cb.apply(this, [{installed: false}]);
        } else {
            ConfigurationModel.findOne({}, function (err, data) {
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
    /*
     * Create socket
     */
    global.io = require('socket.io').listen(this.app);
    
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
};

Bootstrap.prototype.setupViews = function () {
    this.app.all('*', function (req, res, next) {
        console.log(req.sessionID);
        mongooseSessionStore.get(req.sessionID, function (err, session) {
            if (session == null) {
                next();
            } else {
                req.session.loggedIn = session.loggedIn;
            }
        });

        if (!installed && !req.url.match(/^\/templates\/install/)) {
            res.render('install', {
                layout: false
            });
        } else {
            next();
        }
    });
    
    this.app.get('/', function (req, res) {
        mongooseSessionStore.set(req.sessionID, {loggedIn: false});
        
        res.render('index', {
            layout: false,
            isLoggedIn: req.session.loggedIn,
            vdr: JSON.stringify(vdr.plugins)
        });
    });
    
    this.app.get('/templates/*', function (req, res) {
        if (req.session.loggedIn) {
            var template = req.url.substr(1);
            res.render(template, {
                layout: false
            });
        } else {
            if (req.url != '/templates/contact') {
                req.url = '/templates/welcome';
            }
            
            res.render(req.url.substr(1), {
                layout: false
            });
        }
    });
    
    this.app.get('/logo/*', function (req, res) {
        if (req.session.loggedIn) {
            var channel_name = unescape(req.url.substr(6));
            
            var logo = vdr.logoCollection.find(function (logo) {
                return channel_name == logo.get('name');
            });
            
            if (typeof(logo) != 'undefined') {
                var filename = __dirname + '/share/logos/' + logo.get('file');
                res.contentType(filename);
                
                var image = fs.readFileSync(filename);
                
                res.end(image);
            } else {
                res.status(404);
            }
        } else {
            res.status(403);
        }
    });
};

Bootstrap.prototype.setupControllers = function () {
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
    var logos = new LogoCollection();
    
    fs.readdir(__dirname + '/share/logos', function (err, files) {
        if (err) throw err;
        
        files.forEach(function (logo) {
            if (logo.match(/.png$/))
                logos.add({
                    file: logo,
                    name: logo.replace('.png', '')
                });
        });
        
        vdr.logoCollection = logos;
    });
};

module.exports = Bootstrap;