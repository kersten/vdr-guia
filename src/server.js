require.paths.unshift(__dirname + "/models");

var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});
app.use(express.static(__dirname));

app.use(require('browserify')({
    require: [
        __dirname + '/models/ChannelModel'
    ],
    mount: '/browserify.js',
    filter: require('uglify-js')
}));

app.listen(config.web.port);