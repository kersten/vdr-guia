var express = require('express');
var app = express.createServer();
var config = require('./etc/config');

require('./mvc').boot(app);

app.listen(config.web.port);
console.log('Express app started on port ' + config.web.port);


