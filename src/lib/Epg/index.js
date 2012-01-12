var async = require('async');
var channels = mongoose.model('Channel');
var events = mongoose.model('Event');
var movies = mongoose.model('MovieDetail');
var actors = mongoose.model('ActorDetail');

function Epg () {

}

Epg.prototype.getPrimetimeEvent = function (channl_id, day, callback) {
    var date = new Date(day);
    var primetime = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate()) + ' 20:13:00');
    primetime = primetime.getTime() / 1000;

    var primetimeQuery = events.findOne({});

    primetimeQuery.where('channel_id', channl_id);
    primetimeQuery.where('start').gte(primetime);
    primetimeQuery.sort('start', 1);

    primetimeQuery.populate('actors');
    primetimeQuery.populate('tmdbId');

    primetimeQuery.exec(function (err, doc) {
        callback(doc);
    });
};

Epg.prototype.getEvent = function (eventId, callback) {
    var query = events.findOne();
    query.where('_id', eventId);

    query.populate('channel_id');
    query.populate('actors');
    query.populate('tmdbId');
    query.populate('tmdbId.actors');
    query.populate('tmdbId.actors.tmdbId');

    query.run(function (err, doc) {
        if (doc == null) {
            callback(null);
            return;
        }

        if (doc.get('tmdbId')) {
            var details = doc.get('tmdbId');

            details.set('directors', new Array());
            details.set('writers', new Array());
            var tmpActors = details.get('actors');
            details.set('actors', new Array());
            
            async.map(tmpActors, function (actor, callback) {
                var query = actors.findOne({});
                
                query.populate('tmdbId', null, {_id: actor});
                query.run(function (err, doc) {
                    if (err == null) {
                        details.get('actors').push(doc);
                        callback(null, null);
                    } else {
                        callback(null, null);
                    }
                });
            }, function (err, actorsResult) {
                if (details.get('cast') !== undefined) {
                    details.get('cast').forEach(function (cast) {
                        switch (cast.department) {
                            case 'Directing':
                                details.get('directors').push(cast);
                                break;

                            case 'Writing':
                                details.get('writers').push(cast);
                                break;

                            case 'Actors':
                                //details.get('actors').push(cast);
                                break;

                            default:
                                log.dbg('Unknown type for tmdb cast data: ' + cast.department);
                                break;
                        }
                    });
                }

                delete(details.cast);

                doc.set('tmdb', details);
                callback(doc);
            });
            //details.set('actors', new Array());
        } else {
            callback(doc);
        }        
    });
};

Epg.prototype.getEvents = function (channelId, start, limit, callback) {
    var date = new Date();

    var query = events.find({});

    query.where('channel_id', channelId);
    query.$gt('stop', date.getTime() / 1000);
    query.sort('start', 1);
    query.skip(start);
    query.limit(limit);

    query.exec(function (err, doc) {
        callback(doc);
    });
};

Epg.prototype.createTimer = function (eventId) {

};

Epg.prototype.deleteTimer = function (timerId) {

};

module.exports = Epg;