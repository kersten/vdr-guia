var Epg = require('../../../../lib/Epg'),
    log = require('node-logging'),
    EpgTimer = require('../../../../lib/Epg/Timer');

var EventModel = {
    listener: {
        'update': function (data, cb) {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var event = data.model,
                timer = new EpgTimer();

            if (event.timer_exists) {
                log.dbg('Create timer for ' + event.title);
                timer.create(event, cb);
            } else if (!event.timer_exists && event.timer_id !== undefined) {
                log.dbg('Delete timer for ' + event.title);
                timer.del(event, cb);
            }
        }
    }
};

module.exports = EventModel;