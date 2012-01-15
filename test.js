global.log = require('node-logging');

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

/*var title = 'Mission: Impossible 2';

var numberedTitle = new RegExp(' (\\d+|I|II|III|IV|V|VI|VII|VIII|IX)$', 'g');
var numberedTitle = numberedTitle.exec(title);

var movieRoman = '';

if (numberedTitle != null && numberedTitle.length > 0) {
    var number = numberedTitle[1];
    console.log(number);
    switch (number) {
        case '2':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' II');
            break;

        case '3':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' III');
            break;

        case '4':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' IV');
            break;

        case '5':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' V');
            break;

        case '6':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' VI');
            break;

        case '7':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' VII');
            break;

        case '8':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' VIII');
            break;


        case '9':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' IX');
            break;

        case '10':
            movieRoman = movie.title.replace(/ [0-9]{1,2}$/, ' X');
            break;

        case 'I':
            movieRoman = movie.title.replace(/ I$/, ' 1');
            break;

        case 'II':
            movieRoman = movie.title.replace(/ II$/, ' 2');
            break;

        case 'III':
            movieRoman = movie.title.replace(/ III$/, ' 3');
            break;

        case 'IV':
            movieRoman = movie.title.replace(/ IV$/, ' 4');
            break;

        case 'V':
            movieRoman = movie.title.replace(/ V$/, ' 5');
            break;

        case 'VI':
            movieRoman = movie.title.replace(/ VI$/, ' 6');
            break;

        case 'VII':
            movieRoman = movie.title.replace(/ VII$/, ' 7');
            break;

        case 'VIII':
            movieRoman = movie.title.replace(/ VIII$/, ' 8');
            break;

        case 'IX':
            movieRoman = movie.title.replace(/ IX$/, ' 9');
            break;

        case 'X':
            movieRoman = movie.title.replace(/ X$/, ' 10');
            break;
    }
}

var romanTitle = new RegExp("^" + movieRoman + "$", 'ig');

console.log(movieRoman);
//numberedTitle.exec(title);

//console.log(numberedTitle.exec(title));

process.exit();*/

global.mongoose = require('mongoose');
global.Schema = mongoose.Schema;

require('./src/schemas/ChannelSchema');
require('./src/schemas/EventSchema');
require('./src/schemas/ActorSchema');
require('./src/schemas/ActorDetailSchema');
require('./src/schemas/MovieDetailSchema');

console.log('Connect to database ..');
mongoose.connect('mongodb://127.0.0.1/GUIA');
mongoose.connection.on('error', function (e) {
    throw e;
});

var EpgImport = require('./src/lib/Epg/Import');

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