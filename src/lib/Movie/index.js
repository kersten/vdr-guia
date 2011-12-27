var events =  mongoose.model('Event');
var movieDetails =  mongoose.model('MovieDetails');
var async = require('async');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Movie () {
}

Movie.prototype.fetchInformation = function (movie, callback) {
    log.dbg('Fetching informations for: ' + movie.title + ((movie.year !== undefined) ? ' ' + movie.year : ''));

    movieDetails.findOne({'epg_name': movie.title}, function (err, doc) {
        if (doc == null) {
            tmdb.Movie.search({
                query: movie.title + ((movie.year !== undefined) ? ' ' + movie.year : ''),
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    callback.call();
                    return;
                }

                async.map(res, function (tmdbMovie, callback) {
                    if (tmdbMovie == "Nothing found.") {
                        callback.call();
                        return;
                    }

                    tmdb.Movie.getInfo({
                        query: tmdbMovie.id.toString(),
                        lang: 'de'
                    }, function (err, res) {
                        if(typeof(err) != 'undefined') {
                            callback(null, null);
                            return;
                        }

                        res = res[0];

                        if (res.name == movie.title) {
                            res.tmdbId = tmdbMovie.id;
                            res.epg_name = movie.title;

                            var movieDetailsSchema = new movieDetails(res);
                            movieDetailsSchema.save(function () {
                                callback('fin', null);
                            });
                        }

                        callback(null, null);
                    });
                }, function (err, results) {
                    callback.call();
                });
            });
        } else {
            callback.call();
        }
    });
};

Movie.prototype.fetchAll = function () {
    var self = this;
    var query = events.find({});

    query.where('category', 'Spielfilm');

    query.each(function (err, movie, next) {
        if (movie == null) {
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