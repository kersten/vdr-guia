var async = require('async'),
    mongoose = require('mongoose'),
    channels = mongoose.model('Channel'),
    events = mongoose.model('Event'),
    movies = mongoose.model('MovieDetail'),
    actorSchema = mongoose.model('Actor');

function fetchActorDetails (actors, callback) {
    var result = new Array();

    async.map(actors, function (actor, callback) {
        var query = actorSchema.findOne({_id: actor});

        query.populate('tmdbId', ['profile']);
        query.run(function (err, doc) {
            if (doc != null) {
                result.push(doc);
                callback(null, null);
            } else {
                callback(null, null);
            }
        });
    }, function (err, actorsResult) {
        callback(result);
    });
}

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

Epg.prototype.getTodaysHighlight = function (channel_id) {
    var query = events.findOne({'tmdbId.rating': {$exists: true}});

    if (channel_id !== undefined) {
        query.where('channel_id', channel_id);
    }

    query.populate('tmdbId');

    //query.or([{'tmdbId.rating': {$exists: true}}]);
    query.sort('tmdbId.rating', -1);

    query.run(function (err, result) {

    });
};

Epg.prototype._buildEvent = function (doc, withSubEvents, callback) {
    var event = {
        _id: doc.get('_id'),
        channel: doc.get('channel'),
        channel_id: doc.get('channel_id'),
        title: doc.get('title'),
        short_description: doc.get('short_description'),
        description: doc.get('description'),
        start: doc.get('start'),
        stop: doc.get('stop'),
        duration: doc.get('duration'),
        timer_active: doc.get('timer_active'),
        timer_exists: doc.get('timer_exists'),
        timer_id: doc.get('timer_id')
    };

    doc.get('type') !== undefined ? event.type = doc.get('type') : true;
    doc.get('actors') !== undefined ? event.actors = doc.get('actors') : true;
    doc.get('category') !== undefined ? event.category = doc.get('category') : true;
    doc.get('components') !== undefined ? event.components = doc.get('components') : true;
    doc.get('country') !== undefined ? event.country = doc.get('country') : true;
    doc.get('genre') !== undefined ? event.genre = doc.get('genre') : true;
    doc.get('parental_rating') !== undefined ? event.parental_rating = doc.get('parental_rating') : true;
    doc.get('year') !== undefined ? event.year = doc.get('year') : true;

    async.parallel([
        function (callback) {
            if (withSubEvents === true && doc.get('type') == 'series') {
                events.find({
                    title: doc.get('title'),
                    channel_id: doc.get('channel_id').get('_id'),
                    start: {
                        $gt: parseInt(new Date().getTime() / 1000)
                    }
                }, null, {
                    skip: 1,
                    limit: 10,
                    sort: {
                        start: 1
                    }
                }, function (err, docs) {
                    event.broadcastings = docs;
                    callback();
                });
            } else {
                callback();
            }
        }, function (callback) {
            if (doc.get('tmdbId')) {
                if (doc.get('tmdbId').get('translated') === true) {
                    event.description = doc.get('tmdbId').get('overview');
                }

                if (doc.get('tmdbId').get('rating') !== undefined) {
                    event.rating = doc.get('tmdbId').get('rating');
                    event.votes = doc.get('tmdbId').get('votes');
                }

                if (doc.get('tmdbId').get('posters') !== undefined) {
                    if (doc.get('tmdbId').get('posters').length > 0) {
                        doc.get('tmdbId').get('posters').forEach(function (poster) {
                            if (poster.image.size == 'cover') {
                                event.image = poster.image.url;
                                return;
                            }
                        });
                    }

                    event.posters = doc.get('tmdbId').get('posters');
                }

                if (doc.get('tmdbId').get('backdrops') !== undefined) {
                    event.backdrops = doc.get('tmdbId').get('backdrops');

                    var rndBackdrop = new Array();

                    event.backdrops.forEach(function (backdrop) {
                        if (980 <= backdrop.image.width && 1280 >= backdrop.image.width) {
                            rndBackdrop.push(backdrop.image);
                        }
                    });

                    if (rndBackdrop.length != 0) {
                        event.randomBackdrop = rndBackdrop[Math.floor(Math.random() * rndBackdrop.length)];
                    }
                }

                if (doc.get('tmdbId').get('cast') !== undefined) {
                    event.crew = doc.get('tmdbId').get('cast');
                }

                event.actors = doc.get('tmdbId').get('actors');
            } else {
                if (doc.get('rating') != null) {
                    event.rating = doc.get('rating') * 2;
                }
            }

            event.event_id = doc.get('event_id');

            if (event.actors !== undefined && event.actors.length != 0) {
                fetchActorDetails(event.actors, function (actors) {
                    event.actors = actors;
                    callback();
                });
            } else {
                callback();
            }
        }, function (callback) {
            /*dnode.getRating('X-Men', function (result) {
                console.log(result);
                callback();
            });*/
            callback();
        }
    ], function () {
        callback(event);
    });
};

Epg.prototype._query = function (query, withSubEvents, callback) {
    var self = this;

    query.populate('channel_id');
    //query.populate('actors');
    //query.populate('tmdbId');
    //query.populate('tmdbId.actors');

    query.exec(function (err, docs) {
        if (err) {
            log.err(err);
            callback();
            return;
        }

        if (!docs) {
            callback();
            return;
        }

        var result = new Array();

        async.mapSeries(docs instanceof Array ? docs : new Array(docs), function (doc, callback) {
            self._buildEvent(doc, withSubEvents, function (event) {
                result.push(event);
                callback(null, null);
            });
        }, function () {
            if (result.length == 1) {
                callback(result[0]);
            } else {
                callback(result);
            }
        });
    });
};

Epg.prototype.getEvent = function (eventId, callback) {
    var query = events.findOne();
    query.where('_id', eventId);

    query.populate('channel_id');
    query.populate('actors');
    query.populate('tmdbId');
    query.populate('tmdbId.actors');

    this._query(query, true, callback);
};

Epg.prototype.getEventById = function (eventId, channelId, callback) {
    var query = events.findOne({event_id: eventId});

    query.populate('channel_id', null, {channel_id: channelId});
    query.populate('actors');
    query.populate('tmdbId');
    query.populate('tmdbId.actors');

    this._query(query, true, callback);
};

Epg.prototype.getEventsRange = function (channelId, starttime, stoptime, callback) {
    var query = events.find({}, ['event_id', 'title', 'channel', 'type', 'description', 'short_description', 'timer_active', 'timer_exists', 'timer_id', 'start', 'stop', 'duration']);

    query.where('channel_id', channelId);
    query.where('start').gte(starttime).lt(stoptime);
    query.sort('start', 1);

    this._query(query, false, callback);
};

Epg.prototype.getEvents = function (channelId, start, limit, callback) {
    var query = events.find({});

    query.where('channel_id', channelId);
    query.$gt('stop', parseInt(new Date().getTime() / 1000));
    query.sort('start', 1);
    query.skip(start);
    query.limit(limit);

    this._query(query, false, callback);
};

Epg.prototype.searchEvents = function (q, limit, callback) {
    var query = events.find({
        start: {
            $gt: parseInt(new Date().getTime() / 1000)
        }
    });

    query.or([{title: new RegExp(q, "ig")}, {short_description: new RegExp(q, "ig")}, {description: new RegExp(q, "ig")}]);

    query.sort('start', 1);
    query.limit(limit);

    this._query(query, false, callback);
};

Epg.prototype.createTimer = function (eventId) {

};

Epg.prototype.deleteTimer = function (timerId) {

};

module.exports = Epg;