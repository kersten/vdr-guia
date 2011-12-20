var events =  mongoose.model('Event');
var movieDetails =  mongoose.model('MovieDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Movie () {
}

Movie.prototype.fetchInformation = function (movie, callback) {
    console.log('Fetching informations for: ' + movie.title);

    movieDetails.findOne({'epg_name': movie.title}, function (err, doc) {
        if (doc == null) {
            tmdb.Movie.search({
                query: movie.title + (movie.year !== undefined) ? ' ' + movie.year : '',
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    callback.call();
                    return;
                }

                for(var x in res) {
                    if (res[x] == "Nothing found.") {
                        callback.call();
                        return;
                    }

                    tmdb.Movie.getInfo({
                        query: res[x].id.toString(),
                        lang: 'de'
                    }, function (err, res) {
                        if(typeof(err) != 'undefined') {
                            return;
                        }

                        res[0].tmdbId = res[x].id;
                        res[0].epg_name = movie.title;

                        var movieDetailsSchema = new movieDetails(res[0]);
                        movieDetailsSchema.save(function () {
                            callback.call();
                        });
                    });

                    return;
                }
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
        if (movie === undefined) {
            return;
        }

        if (next === undefined) {
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