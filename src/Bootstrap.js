var fs = require("fs");
var i18n = require('i18n');

function Bootstrap (app, express) {
    this.app = app;
    this.express = express;
    
    this.setupExpress();
    this.setupSocketIo();
    this.setupDatabase();
    
    this.setupControllers();
    this.setupViews();
}

Bootstrap.prototype.setupExpress = function () {
    var SessionMongoose = require("session-mongoose");
    var mongooseSessionStore = new SessionMongoose({
        url: "mongodb://localhost/GUIAsession",
        interval: 120000 // expiration check worker run interval in millisec (default: 60000)
    });
    
    this.app.use(this.express.bodyParser());
    this.app.use(this.express.cookieParser());
    
    this.app.use(this.express.session({
        store: mongooseSessionStore,
        secret: '4dff4ea340f0a823f15d3f4f01ab62eae0e5da579ccb851f8db9dfe84c58b2b37b89903a740e1ee172da793a6e79d560e5f7f9bd058a12a280433ed6fa46510a',
        key: 'guia.id'
    }));
    
    this.app.use(i18n.init);

    i18n.configure({
        // setup some locales - other locales default to en silently
        locales:['en', 'de'],

        // where to register __() and __n() to, might be "global" if you know what you are doing
        register: global
    });
    
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
};

Bootstrap.prototype.setupDatabase = function () {
    global.mongoose = require('mongoose');
    global.Schema = mongoose.Schema;
    
    mongoose.connect('mongodb://localhost/GUIA');
};

Bootstrap.prototype.setupSocketIo = function () {
    /*
     * Create socket
     */
    global.io = require('socket.io').listen(this.app);
};

Bootstrap.prototype.setupViews = function () {
    var ConfigurationModel = require('./dbmodels/ConfigurationModel');
    
    this.app.all('*', function (req, res, next) {
        /*
         * Chek if the app ist installed. If not deliver the install view
         */
        ConfigurationModel.count({}, function (err, cnt) {
            if (cnt == 0) {
                require(__dirname + '/controllers/InstallController');

                res.render('install', {
                    layout: false
                });
            } else {
                next();
            }
        });
    });
    
    this.app.get('/', function (req, res) {
        res.render('index', {
            layout: false
        });
    });
};

Bootstrap.prototype.setupControllers = function () {
    
};

module.exports = Bootstrap;