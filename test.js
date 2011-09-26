require.paths.unshift(__dirname + "/src/lib");
var util = require('util'),    
    http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, i know nodejitsu.')
  res.end();
}).listen(8000);


var epgdata2vdr = require('epgdata2vdr');