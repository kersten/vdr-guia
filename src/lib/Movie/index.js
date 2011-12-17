var events =  mongoose.model('Event');
var moviesSchema =  mongoose.model('Movie');
var actorDetails =  mongoose.model('ActorDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Movie () {
    
}

Movie.prototype.scrapeAll = function () {
    var query = events.find({});
    
    query.select('title', 'hasTmdb');
    query.where('type', 'Spielfilm');
    
    query.each(function (err, movie, next) {
        if (next === undefined) {
            return;
        }
        
        if (err) console.log(err);
        
        if (movie == null) {
            next();
            return;
        }
            
        if (movie.hasTmdb !== undefined) {
            next();
            return;
        }
        
        tmdb.Movie.search({
            query: movie.title,
            lang: 'de'
        }, function(err,res) {
            if (res[x] == "Nothing found.") {
                next();
                return;
            }
            
            for(var x in res) {
                if (res[x] == "Nothing found.") {
                    next();
                    return;
                }
                
                if (res.length > 1) {
                    console.log(res);
                    console.log('More resulsts possible .. check title');
                    
                    if (res[x].name != movie.title) {
                        next();
                        return;
                    }
                }
                
                tmdb.Movie.getInfo({
                    query: res[x].id.toString(),
                    lang: 'de'
                }, function (err, res) {
                    res[0].epg_name = movie.title;

                    var movieSchema = new moviesSchema(res[0]);
                    movieSchema.save(function (err, doc) {
                        next();
                    });
                });
            }
        });
            
            /*actorDetails.findOne({'epg_name': actor.name}, function (err, doc) {
                if (doc == null) {
                    console.log('Get infos on Actor "' + actor.name + '" ..');
                    
                    tmdb.Person.search({
                        query: actor.name,
                        lang: 'de'
                    }, function (err, res) {
                        if(typeof(err) != 'undefined') {
                            next();
                            return;
                        }

                        for(var x in res) {
                            if (res[x] == "Nothing found.") {
                                next();
                                return;
                            }

                            tmdb.Person.getInfo({
                                query: res[x].id.toString(),
                                lang: 'de'
                            }, function (err, res) {
                                if(typeof(err) != 'undefined') {
                                    next();
                                    return;
                                }
                                
                                res[0].epg_name = actor.name;

                                var actorDetailsSchema = new actorDetails(res[0]);
                                actorDetailsSchema.save(function (err, doc) {
                                    next();
                                });
                            });
                        }
                    });
                } else {
                    console.log('Actor "' + actor.name + '" found .. ignoring');
                    next();
                }
            });*/
    });
};

module.exports = Movie;