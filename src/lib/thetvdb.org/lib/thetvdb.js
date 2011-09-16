var parser = require('xml2json'),
    request = require('request');

var mirror = null;
var languages = null;

var getLanguages = function () {
    request({uri: mirror + '/languages.xml'}, function (error, response, body) {
        languages = JSON.parse(parser.toJson(body));
    });
};

var getSeries = function (name, cb) {
    request({uri: 'http://thetvdb.com/api/GetSeries.php?seriesname=' + name}, function (error, response, body) {
        var result = JSON.parse(parser.toJson(body));
        console.log(typeof(result.Data.Series));
        if (typeof(result.Data.Series) == 'object') {
            for (var i in result.Data.Series) {
                console.log(result.Data.Series[i]);
            }
        }
    });
};

exports.getSeries = getSeries;

exports.createService = function (options) {
    console.log('thedvdb.org service created');

    request({uri: 'http://thetvdb.com/api/' + options.apikey + '/mirrors.xml'}, function (error, response, body) {
        console.log(JSON.parse(parser.toJson(body)));
        mirror = JSON.parse(parser.toJson(body)).Mirrors.Mirror.mirrorpath + '/api/' + options.apikey;
        getLanguages();
    });
    
    getSeries('Eureka');
};