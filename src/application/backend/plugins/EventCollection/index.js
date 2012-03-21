var Epg = require('../../../../lib/Epg'),
    mongoose = require('mongoose'),
    Event = mongoose.model('Event');

var EventCollection = {
    listener: {
        "getEpg:read": function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            var epg = new Epg();
            epg.getEvents(data._id, 0, 100, function (events) {
                cb(events);
            });
        },

        'cloud:read': function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            var date = new Date();

            var starttime = date;
            starttime = parseInt(starttime.getTime() / 1000);

            var stoptime = starttime + 3600;

            var query = Event.distinct('title', {
                start: {$gte: starttime, $lt: stoptime}
            }, function (err, docs) {
                cb(docs);
            });

            /*query.exec(function (err, docs) {
                cb(docs);
            });*/
        }
    }
};

module.exports = EventCollection;