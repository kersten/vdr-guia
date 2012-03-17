var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});
app.listen(config.web.ssl);

var appHttp = express.createServer();
appHttp.listen(config.web.port);

appHttp.all('*', function (req, res) {
    var host = req.headers["host"].split(':');
    res.redirect('https://' + host[0] + ':' + config.web.ssl + req.url);
});

var Bootstrap = require('./Bootstrap');

var GUIA = new Bootstrap(app, express);
global.GUIA = GUIA;

process.setuid('nobody');
