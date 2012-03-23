var Epg = require('../../../../lib/Epg'),
    mongoose = require('mongoose'),
    Event = mongoose.model('Event');

var EventCollection = {
    listener: {
        "read": function (data, cb) {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var date = new Date();

            date.setFullYear(
                parseInt(data.date.year, 10),
                parseInt(data.date.month, 10) - 1,
                parseInt(data.date.day, 10)
            );

            date.setHours(5);
            date.setMinutes(0);

            var primetime = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate()) + ' 20:13:00');
            primetime = primetime.getTime() / 1000;

            var starttime = date;
            starttime = parseInt(starttime.getTime() / 1000);

            var stoptime = starttime + 86400;

            var epg = new Epg();
            epg.getEventsRange(data.channel_id, starttime, stoptime, cb);
        },

        "getEpg:read": function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            var epg = new Epg();
            epg.getEvents(data._id, data.page * 10 - 10, 10, function (events) {
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