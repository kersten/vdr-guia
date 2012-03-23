var fs = require('fs'),
    asyncSrc = fs.readFileSync(require.resolve('async/lib/async'));

var Async = {
    routes: {
        '/async/async.js': function (req, res) {
            res.header('Content-Type', 'application/javascript');
            res.end(asyncSrc);
        }
    }
};

module.exports = Async;