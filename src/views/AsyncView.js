var fs = require('fs');
var asyncSrc = fs.readFileSync('node_modules/async/lib/async.js');

var TemplateView = {
    url: '/js/async.js',
    func: function (req, res) {
        res.end(asyncSrc);
    }
};

module.exports = TemplateView;