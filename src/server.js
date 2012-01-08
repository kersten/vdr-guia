var express = require('express');
var fs = require("fs");

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var config = require('./etc/config');

var app = express.createServer({key: privateKey, cert: certificate});
app.listen(config.web.port);

var Bootstrap = require('./Bootstrap');

var GUIA = new Bootstrap(app, express);
global.GUIA = GUIA;