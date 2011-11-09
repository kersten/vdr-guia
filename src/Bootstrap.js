var fs = require("fs");
var i18n = require('i18n');
var rest = require('restler');
var http = require('http');

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
        url: "mongodb://127.0.0.1/GUIAsession"
    });
    
    this.app.use(this.express.bodyParser());
    this.app.use(this.express.cookieParser());
    
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
    
    /*
     * Set public directory for directly serving files
     */
    this.app.use(this.express.static(__dirname + '/lib/public'));
    this.app.use(this.express.favicon(__dirname + '/lib/public/img/favicon.ico'));
    
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

    /*fs.readdirSync(__dirname + '/models').forEach(function (file) {
        browserify.push(__dirname + '/models/' + file);
    });*/

    browserify.push('node-uuid');

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
    
    console.log('Connect to database ..');
    mongoose.connect('mongodb://127.0.0.1/GUIA');
    mongoose.connection.on('error', function (e) {
        throw e;
    });
    
    var ConfigurationModel = require('./schemas/ConfigurationSchema');
    
    ConfigurationModel.count({}, function (err, cnt) {
        if (cnt == 0) {
            console.log('Not installed! Delivering installation');
            
            require(__dirname + '/controllers/InstallController');

            cb.apply(this, [{
                installed: false
            }]);
        } else {
            console.log('GUIA installed! Getting configuration ..');
            
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
    console.log('Setting up socket.io ..');
    
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
    console.log('Setting up views ..');
    
    this.app.all('*', function (req, res, next) {
        console.log('Incoming request ..');
        
        if (!installed && !req.url.match(/^\/templates\/install/)) {
            console.log('serving installation ..');
            res.render('install', {
                layout: false
            });
        } else {
            console.log('Process request ..');
        
            mongooseSessionStore.get(req.sessionID, function (err, session) {
                if (session == null) {
                    console.log('Not loggedin ..');
                } else {
                    console.log('Loggedin ..');
                    req.session.loggedIn = session.loggedIn;
                }
                
                next();
            });
        }
    });
    
    this.app.get('/', function (req, res) {
        console.log('Render index.html ..');
        
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
            if (installed) {
                if (req.url != '/templates/contact') {
                    req.url = '/templates/welcome';
                }
            }
            
            res.render(req.url.substr(1), {
                layout: false
            });
        }
    });
    
    var LogoSchema = require('./schemas/LogoSchema');
    
    this.app.get('/logo/*', function (req, res) {
        if (req.session.loggedIn) {
            var channel_name = unescape(req.url.substr(6)).replace(/\//, '|');
            
            LogoSchema.findOne({name: channel_name}, function (err, data) {
                if (err || data == null) {
                    console.log('Logo ' + channel_name + ' not found, getting placeholder');
                    
                    var http_client = http.createClient(80, 'placehold.it');
                    var image_get_request = http_client.request('GET', 'http://placehold.it/90x51.png&text=' + req.url.substr(6), {
                        'Host': 'placehold.it',
                        "User-Agent": 'Firefox/7.0.1',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    });
                    
                    image_get_request.addListener('response', function(proxy_response){
                        var current_byte_index = 0;
                        var response_content_length = parseInt(proxy_response.header("Content-Length"));
                        var response_body = new Buffer(response_content_length);
                        
                        proxy_response.setEncoding('binary');
                        proxy_response.addListener('data', function(chunk){
                            response_body.write(chunk, current_byte_index, "binary");
                            current_byte_index += chunk.length;
                        });
                        proxy_response.addListener('end', function(){
                            fs.writeFile(__dirname + '/share/logos/' + channel_name + '.png', response_body, function (err) {
                                var logoModel = new LogoSchema({
                                    file: channel_name + '.png',
                                    name: channel_name
                                });
                                
                                logoModel.save();
                            });
                            
                            res.contentType('image/png');
                            res.send(response_body);
                        });
                    });
                    
                    image_get_request.end();
                } else {
                    var filename = __dirname + '/share/logos/' + data.file;
                    res.contentType(filename);
                    
                    var image = fs.readFileSync(filename);
                    
                    res.end(image);
                }
            });
        } else {
            res.status(403);
        }
    });
};

Bootstrap.prototype.setupControllers = function () {
    console.log('Setting up controllers ..');
    
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
    var LogoSchema = require('./schemas/LogoSchema');
    
    console.log('Setting up logos ..');
    
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
        
        console.log('done');
    });
};

module.exports = Bootstrap;