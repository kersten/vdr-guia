require.paths.unshift(__dirname + "/models");

var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});
app.use(express.static(__dirname));

var browserify = new Array();

fs.readdirSync(__dirname + '/models').forEach(function (file) {
    browserify.push(__dirname + '/models/' + file);
});

app.use(require('browserify')({
    require: browserify,
    mount: '/browserify.js',
    filter: require('uglify-js')
}));

app.listen(config.web.port);