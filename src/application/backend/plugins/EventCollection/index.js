var Epg = require('../../../../lib/Epg');

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
        }
    }
};

module.exports = EventCollection;