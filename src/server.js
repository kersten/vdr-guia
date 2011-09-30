require.paths.unshift(__dirname + "/models");

var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});

/*
 * Set public directory for directly serving files
 */
app.use(express.static(__dirname + '/lib/public'));

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

/*
 * Create socket
 */
var io = require('socket.io').listen(app);

/*
 * Create browserify array for included modules to web interface
 */
var browserify = new Array();

fs.readdirSync(__dirname + '/models').forEach(function (file) {
    browserify.push(__dirname + '/models/' + file);
});

browserify.push('jquery-browserify', 'backbone-browserify');

/*
 * Use browserify in our express app
 */
app.use(require('browserify')({
    require: browserify,
    mount: '/browserify.js'
    //filter: require('uglify-js')
}));

/*
 * Check some basics on every request
 */
app.all('*', function (req, res, next) {
    console.log(req.url);
    /*
     * Chek if the app ist installed. If not deliver the install view
     */
    if (!req.url.match(/^\/install/)) {
        try {
            fs.lstatSync(__dirname + '/etc/user').isFile()
        } catch (e) {
            console.log('Not installed .. redirect to installation');
            res.redirect('/install');
            return;
        }
    }
    
    next();
});

/*
 * Install view
 */
app.get('/install', function (req, res) {
    res.render('install', {
        layout: false
    });
});

io.sockets.on('connection', function (socket) {
    socket.on('Channel:create', function (data) {
        console.log(data);
    });
})

app.listen(config.web.port);