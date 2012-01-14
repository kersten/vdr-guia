/*console.log(require.resolve('async/lib/async'));
process.exit();

var Thetvdb = require('./src/lib/Media/Scraper/Thetvdb');

var tvdb = new Thetvdb('3258B04D58376067', 'de');
tvdb.getSeries('Dexter', function (result) {
    console.log(result);
});*/

/*
global.mongoose = require('mongoose');
global.Schema = mongoose.Schema;

require('./src/schemas/EventSchema');
require('./src/schemas/ActorSchema');
require('./src/schemas/ActorDetailsSchema');
require('./src/schemas/MovieSchema');

console.log('Connect to database ..');
mongoose.connect('mongodb://127.0.0.1/GUIA');
mongoose.connection.on('error', function (e) {
    throw e;
});

var Actor = require('./src/lib/Actor');
var actor = new Actor();

actor.scrapeAll();

//var Movie = require('./src/lib/Movie');
//var movie = new Movie();

//movie.scrapeAll();
}); */

global.mongoose = require('mongoose');
global.Schema = mongoose.Schema;

require('./src/schemas/EventSchema');
require('./src/schemas/ActorSchema');
require('./src/schemas/ActorDetailSchema');
require('./src/schemas/MovieDetailSchema');

console.log('Connect to database ..');
mongoose.connect('mongodb://127.0.0.1/GUIA');
mongoose.connection.on('error', function (e) {
    throw e;
});

var EmpgImport = require('./src/lib/Epg/Import');

var importer = new EpgImport();

importer.evaluateType();

/*var date = new Date();
date.setHours(0, 0, 0);

var start = parseInt(date.getTime() / 1000);

date.setHours(23, 59, 59);

var stop = parseInt(date.getTime() / 1000);

events.find({tip: {$exists: true}, start: {$gt: start, $lt: stop}}, function (err, docs) {
    console.log(docs);
    console.log(start, stop);
    process.exit();
});*/