var fs = require('fs');
var asyncSrc = fs.readFileSync(require.resolve('async/lib/async'));

var TemplateView = {
    url: '/js/async.js',
    func: function (req, res) {
        res.header('Content-Type', 'application/javascript');
        res.end(asyncSrc);
    }
};

module.exports = TemplateView;