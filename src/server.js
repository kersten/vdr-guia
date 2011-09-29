require.paths.unshift(__dirname + "/models");

var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});
app.use(express.static(__dirname));

var io = require('socket.io').listen(app);

var browserify = new Array();

browserify.push('jquery-browserify', 'backbone-browserify');

fs.readdirSync(__dirname + '/models').forEach(function (file) {
    browserify.push(__dirname + '/models/' + file);
});

app.use(require('browserify')({
    require: browserify,
    mount: '/browserify.js'
    //filter: require('uglify-js')
}));

io.sockets.on('connection', function (socket) {
    socket.on('Channel:create', function (data) {
        console.log(data);
    });
})

app.listen(config.web.port);