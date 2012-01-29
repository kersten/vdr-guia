var events =  mongoose.model('Event');
var movieDetails =  mongoose.model('MovieDetail');
var actors =  mongoose.model('Actor');
var async = require('async');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Movie () {
}

Movie.prototype.fetchInformation = function (movie, callback) {
    log.dbg('Fetching movie informations for: ' + movie.title);

    dnode.getMovie(movie.title, function (res) {
        if (res && res.name !== undefined) {
            var movieDetailsSchema = new movieDetails(res);
            movieDetailsSchema.save(function (err) {
                movie.set({tmdbId: movieDetailsSchema._id});

                movie.save(function () {
                    log.dbg('Details saved for: ' + movie.title);
                    callback();
                });
            });
        } else {
            log.dbg('Nohting found for: ' + movie.title);
            callback();
        }
    });
};

Movie.prototype.fetchAll = function (callback) {
    var self = this;
    var query = events.find({
        'tmdbId.name': {$exists: false}
    });

    query.sort('title', 1);
    query.where('category', new RegExp('film', 'ig'));

    query.each(function (err, movie, next) {
        if (movie == null) {
            log.dbg('Fetching movies finished ..');
            callback();
            return;
        }

        if (movie.title === undefined) {
            next();
            return;
        }

        self.fetchInformation(movie, next);
    });
};

module.exports = Movie;