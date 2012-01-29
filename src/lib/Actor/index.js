var events =  mongoose.model('Event');
var actors =  mongoose.model('Actor');
var actorDetails =  mongoose.model('ActorDetail');
var async = require('async');

function Actor () {
}

Actor.prototype.fetchInformation = function (actor, callback) {
    log.dbg('Fetching actor informations for: ' + actor.name);

    if (socialize && dnode) {
        dnode.getActor(actor.name, function (res) {
            if (res && res != {}) {
                var actorDetailsSchema = new actorDetails(res);
                actorDetailsSchema.save(function (err) {
                    actor.set({tmdbId: actorDetailsSchema._id});

                    actor.save(function () {
                        log.dbg('Details saved for: ' + actor.name);
                        callback();
                    });
                });
            } else {
                log.dbg('Nohting found for: ' + actor.name);
                callback();
            }
        });
    } else {
        callback();
    }
};

Actor.prototype.fetchAll = function (callback) {
    var self = this;
    var query = actors.find({
        tmdbId: {$exists: false}
    });

    query.sort('name', 1);

    query.each(function (err, actor, next) {
        if (actor == null) {
            log.dbg('Fetching actors finished ..');
            callback();
            return;
        }

        self.fetchInformation(actor, next);
    });
};

module.exports = Actor;