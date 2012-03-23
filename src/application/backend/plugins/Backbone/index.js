var fs = require('fs'),
    backboneSrc = fs.readFileSync(require.resolve('backbone/backbone')),
    underscoreSrc = fs.readFileSync(require.resolve('underscore/underscore'));

var Backbone = {
    routes: {
        '/backbone/backbone.js': function (req, res) {
            res.header('Content-Type', 'application/javascript');
            res.end(backboneSrc);
        },

        '/backbone/underscore.js': function (req, res) {
            res.header('Content-Type', 'application/javascript');
            res.end(underscoreSrc);
        }
    }
};

module.exports = Backbone;