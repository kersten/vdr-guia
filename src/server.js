var express = require('express');
var fs = require("fs");
var crypto = require('crypto');
var config = require('./etc/config');

var privateKey = fs.readFileSync(__dirname + '/etc/cert/server.key').toString();
var certificate = fs.readFileSync(__dirname + '/etc/cert/server.crt').toString();

var app = express.createServer({key: privateKey, cert: certificate});
var io = require('socket.io').listen(app);

require('./mvc').boot(app, io);

app.listen(config.web.port);

console.log('Express app started on port ' + config.web.port);