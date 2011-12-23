var Thetvdb = require('./src/lib/Media/Scraper/Thetvdb');

var tvdb = new Thetvdb('3258B04D58376067', 'de');
tvdb.getSeries('Dexter', function (result) {
    console.log(result);
});

<<<<<<< HEAD
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
=======
/*var tmdb = require('./src/lib/Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

tmdb.Movie.search({
    query: 'Matrix',
    lang: 'de'
}, function(err,res) {
    for(var x in res) {
        tmdb.Movie.getInfo({
            query: res[x].id.toString(),
            lang: 'de'
        }, function (err, res) {
            console.log(res[0].cast);
        });
    }
});*/
>>>>>>> ade30b4de1a72ef0b93ef2a140099b6a82e19a33
