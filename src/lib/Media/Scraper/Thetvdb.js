var request = require('request');
var util = require('util');
var DomJS = require("dom-js").DomJS;

function Thetvdb (apiKey, language) {
    this.apikey = apiKey;
    this.language = language || 'en';
    
    this.mirror = null;
}

Thetvdb.prototype.getSeries = function (name, callback) {
    var self = this;
    
    this.query( 'GetSeries.php?seriesname=' + name + '&language=' + this.language, function (res) {
        if (res.Data.Series.length === undefined) {
            callback(res.Data.Series);
        } else {
            var series = res.Data.Series;
            var seriesFound = false;
            
            series.forEach(function (series) {
                if (series.language == self.language && series.SeriesName == name) {
                    seriesFound = true;
                    callback(series);
                    return;
                }
            });
            
            if (!seriesFound) {
                callback(res.Data.Series);
            }
        }
    });
};

Thetvdb.prototype.getMirror = function (callback) {
    var self = this;
    // http://www.thetvdb.com/api/<apikey>/mirrors.xml
    request({uri: encodeURI('http://www.thetvdb.com/api/' + this.apikey + '/mirrors.xml')}, function (error, response, body) {
        var domjs = new DomJS();
        domjs.parse(body, function(err, dom) {
            if (dom.children) {
                console.log(dom.children[1]);
            }
            
            process.exit();
        });
        
        return;
        var res = JSON.parse(parser.toJson(body));
        
        if (res.Mirrors.length === undefined) {
            self.mirror = res.Mirrors.Mirror.mirrorpath;
        } else {
            self.mirror = res.Mirrors[0].Mirror.mirrorpath;
        }
        
        callback();
    });
};

Thetvdb.prototype.query = function (url, callback) {
    var self = this;
    var useApiKey = true;
    
    if (this.mirror == null) {
        this.getMirror(function () {
            self.query(url, callback);
        });
        
        return;
    }
    
    if (url.match(/\.php/)) {
        useApiKey = false;
    }
    
    request({uri: encodeURI(this.mirror + '/api/' + ((useApiKey) ? this.apikey + '/' : '') + url)}, function (error, response, body) {
        console.log(body);
        //var json = JSON.parse(parser.toJson(body));
        //callback(json);
    });
};

module.exports = Thetvdb;