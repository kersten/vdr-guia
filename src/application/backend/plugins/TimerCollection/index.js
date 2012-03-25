var EpgTimer = require('../../../../lib/Epg/Timer'),
    log = require('node-logging');

var TimerCollection = {
    listener: {
        create: function (data, cb) {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var model = data.model;
            var timer = new EpgTimer();

            timer.create(model, function () {
                cb();
            });
        },

        update: function () {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var model = data.model;
            var timer = new EpgTimer();

            timer.update(model, function () {
                cb();
            });
        },

        delete: function () {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var model = data.model;
            var timer = new EpgTimer();

            timer.del(model, function () {
                cb();
            });
        },

        read: function (data, cb) {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var timer = new EpgTimer();

            timer.getAll(cb);
        }
    },

    init: function () {
        this.refreshTimer();
    },

    refreshTimer: function () {
        log.inf('Refresh timer');

        var timer = new EpgTimer();
        timer.refresh();
    },

    cronjobs: [{
        '0 */5 * * * *': function () {
            TimerCollection.refreshTimer();
        }
    }]
};

module.exports = TimerCollection;