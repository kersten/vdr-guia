var events =  mongoose.model('Event');
var actors =  mongoose.model('Actor');
var actorDetails =  mongoose.model('ActorDetail');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Actor () {
}

Actor.prototype.fetchInformation = function (actor, callback) {
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
                callback.call();
                return;
            }

            tmdb.Person.getInfo({
                query: res[x].id.toString(),
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    return;
                }

                res[0].tmdbId = res[x].id;
                //res[0].actorID = actorId;

                var actorDetailsSchema = new actorDetails(res[0]);
                actorDetailsSchema.save(function () {
                    actor.set({tmdbId: actorDetailsSchema._id});

                    actor.save(function () {
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
    var query = actors.find({tmdbId: {$exists: false}});

    query.each(function (err, actor, next) {
        if (actor == null) {
            return;
        }

        self.fetchInformation(actor, next)
    });
};

module.exports = Actor;