var events =  mongoose.model('Event');
var actors =  mongoose.model('Actor');
var actorDetails =  mongoose.model('ActorDetail');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Actor () {
}

Actor.prototype.fetchInformation = function (actor, callback) {
    log.dbg('Fetching informations for: ' + actor.name);
    
    tmdb.Person.search({
        query: actor.name,
        lang: 'de'
    }, function (err, res) {
        if(typeof(err) != 'undefined') {
            callback.call();
            return;
        }

        for(var x in res) {
            if (res[x] == "Nothing found.") {
                log.dbg('Nothing found for: ' + actor.name);
                
                actor.set({tmdbSearched: new Date().getTime()});
                actor.save(function () {
                    callback.call();
                });
                
                return;
            }

            tmdb.Person.getInfo({
                query: res[x].id.toString(),
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    log.dbg('some error: ' + err);

                    actor.set({tmdbSearched: new Date().getTime()});
                    actor.save(function () {
                        callback.call();
                    });
                    
                    return;
                }

                res[0].tmdbId = res[x].id;
                //res[0].actorID = actorId;

                var actorDetailsSchema = new actorDetails(res[0]);
                actorDetailsSchema.save(function () {
                    actor.set({tmdbId: actorDetailsSchema._id});

                    actor.save(function () {
                        log.dbg('Details saved for: ' + actor.name);
                        callback.call();
                    });
                });
            });

            return;
        }
    });
};

Actor.prototype.fetchAll = function () {
    var self = this;
    var query = actors.find({
        tmdbId: {$exists: false},
        tmdbSearched: {$exists: false}
    });
    
    query.sort('name', 1);

    query.each(function (err, actor, next) {
        if (actor == null) {
            log.dbg('Fetching actors finished ..');
            return;
        }

        self.fetchInformation(actor, next)
    });
};

module.exports = Actor;