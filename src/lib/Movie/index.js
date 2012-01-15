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
    log.dbg('Fetching informations for: ' + movie.title);

    tmdb.Movie.search({
        query: movie.title,
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

                log.dbg('Found movie with name: ' + res.name + ' || ' + res.original_name);

                var title = new RegExp("^" + movie.title + "$", 'ig');

                var numberedTitle = new RegExp(' (\\d+|I|II|III|IV|V|VI|VII|VIII|IX|X)$', 'g');
                var numberedTitle = numberedTitle.exec(movie.title);

                var movieRoman = '';

                if (numberedTitle != null && numberedTitle.length > 0) {
                    var number = numberedTitle[1];

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

                if (title.test(res.original_name) || title.test(res.name) || romanTitle.test(res.name) || romanTitle.test(res.original_name)) {
                    movieDetails.findOne({tmdbId: tmdbMovie.id}, function (err, doc) {
                        if (doc == null) {
                            var tmpMovie = res;
                            var cast = tmpMovie.cast;
                            tmpMovie.actors = new Array();
                            tmpMovie.cast = new Array();

                            tmpMovie.tmdbId = tmdbMovie.id;

                            async.map(cast, function (a, callback) {
                                if (a.character == '') {
                                    tmpMovie.cast.push(a);
                                    callback(null, null);
                                    return;
                                }

                                actors.findOne({name: a.name, character: a.character}, function (err, doc) {
                                    if (doc == null) {
                                        var actor = new actors({
                                            name: a.name,
                                            character: a.character
                                        });

                                        actor.save(function () {
                                            tmpMovie.actors.push(actor._id);
                                            callback(null, null);
                                        });
                                    } else {
                                        tmpMovie.actors.push(doc._id);
                                        callback(null, null);
                                    }
                                });
                            }, function (err, result) {
                                var movieDetailsSchema = new movieDetails(tmpMovie);
                                movieDetailsSchema.save(function () {
                                    movie.set({tmdbId: movieDetailsSchema._id});
                                    movie.save(function () {
                                        log.dbg('Movie details saved .. ');
                                        callback('fin');
                                    });
                                });
                            });
                        } else {
                            movie.set({tmdbId: doc._id});
                            movie.save(function () {
                                log.dbg('Movie details saved .. ');
                                callback('fin');
                            });
                        }
                    });
                } else {
                    callback(null, null);
                }
            });
        }, function (err, results) {
            if (err == null) {
                movie.set({
                    tmdbSearched: new Date().getTime()
                });

                movie.save();
            }

            callback.call();
        });
    });
};

Movie.prototype.fetchAll = function () {
    var self = this;
    var query = events.find({
        tmdbId: {$exists: false},
        tmdbSearched: {$exists: false}
    });

    query.sort('title', 1);
    query.where('category', new RegExp('film', 'ig'));

    query.each(function (err, movie, next) {
        if (movie == null) {
            log.dbg('Fetching movies finished ..');
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