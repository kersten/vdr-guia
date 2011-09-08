var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var config = require('./etc/config');

require('./mvc').boot(app, io);

app.listen(config.web.port);
console.log('Express app started on port ' + config.web.port);


