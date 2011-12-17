var events =  mongoose.model('Event');
var actorDetails =  mongoose.model('ActorDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Actor () {
    
}

Actor.prototype.scrapeAll = function () {
    var query = events.find({});
    
    query.select('actors');
    
    query.each(function (err, actors, next) {
        if (err) console.log(err);
        
        if (actors.actors.length == 0) {
            next();
        }
        
        actors.actors.forEach(function (actor) {
            actorDetails.findOne({'epg_name': actor.name}, function (err, doc) {
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
            });
        });
    });
};

module.exports = Actor;