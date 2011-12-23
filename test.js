var Thetvdb = require('./src/lib/Media/Scraper/Thetvdb');

var tvdb = new Thetvdb('3258B04D58376067', 'de');
tvdb.getSeries('Dexter', function (result) {
    console.log(result);
});

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
