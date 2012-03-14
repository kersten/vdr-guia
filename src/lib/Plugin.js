var async = require('async'),
    fs = require('fs'),
    mime = require('mime'),
    walk = require('walk');

function Plugin (name, config, app) {
    this.name = name;
    this.config = config;
    this.app = app;
}

Plugin.prototype.init = function (cb) {
    var _this = this;

    if (!this.config.active) {
        cb({});
        return;
    }

    var config = {};

    async.parallel([
        function (cb) {
            _this.initPublic(function (publicFiles) {
                config.publicFiles = publicFiles;
                cb(null);
            });
        }, function (cb) {
            _this.initRoutes(function (routes) {
                config.routes = routes;
                cb(null);
            });
        }
    ], function () {
        cb(config);
    });
};

Plugin.prototype.initRoutes = function (cb) {
    if (this.config.routes) {
        cb(this.config.routes);
        return;
    }

    cb();
};

Plugin.prototype.initPublic = function (cb) {
    var _this = this;
    var pluginDir = this.config.pluginDir;

    var publicFiles = [];

    walker = walk.walk(pluginDir + '/' + this.name + '/public', {
        followLinks: false
    });

    walker.on("names", function (root, nodeNamesArray) {
        nodeNamesArray.sort(function (a, b) {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        });
    });

    walker.on("file", function (root, fileStats, next) {
        var dir = root.replace(pluginDir + '/' + _this.name + '/public/', '');

        fs.readFile(root + '/' + fileStats.name, function (err, file) {
            type = mime.lookup(root + '/' + fileStats.name);

            publicFiles.push({type: type, src: '/' + _this.name + '/' + dir + '/' + fileStats.name});
            _this.app.get('/' + _this.name + '/' + dir + '/' + fileStats.name, function (req, res) {
                if (!res.getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
                if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=0');
                if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', fileStats.mtime.toUTCString());
                if (!res.getHeader('Content-Type')) {
                    var charset = mime.charsets.lookup(type);
                    res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
                }

                res.setHeader('Content-Length', fileStats.size);
                res.end(file.toString());
            });

            next();
        });
    });

    walker.on("errors", function (root, nodeStatsArray, next) {
        next();
    });

    walker.on("end", function () {
        cb(publicFiles);
    });
};

module.exports = Plugin;