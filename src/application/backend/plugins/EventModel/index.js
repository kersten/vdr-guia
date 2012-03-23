var Epg = require('../../../../lib/Epg'),
    log = require('node-logging'),
    mongoose = require('mongoose'),
    Configuration = mongoose.model('Configuration'),
    events = mongoose.model('Event'),
    rest = require('restler');

var EventModel = {
    listener: {
        'update': function (data, cb) {
            if (!this.handshake.session.loggedIn) {
                return false;
            }

            var event = data.model,
                restful;

            Configuration.findOne({}, function (err, doc) {
                if (doc) {
                    restful = 'http://' + doc.get('vdrHost') + ':' + doc.get('restfulPort');
                    if (event.timer_exists) {
                        log.dbg('Create timer for ' + event.title);

                        rest.post(restful + '/timers', {
                            data: {
                                channel: event.channel,
                                eventid: event.event_id,
                                minpre: 5,
                                minpost: 15
                            }
                        }).on('success', function (data) {
                                log.dbg('Timer created: ' + data.timers[0].id);

                                event.timer_exists = true;
                                event.timer_id = data.timers[0].id;

                                events.update({_id: event._id}, {timer_exists: true, timer_id: data.timers[0].id}, {upsert: true}, function () {
                                    console.log(arguments);
                                });

                                cb(event);
                            }).on('error', function (err) {
                                log.err('Error creating timer: ' + JSON.stringify(err));
                            }).on('403', function (err) {
                                log.err('Error creating timer: ' + JSON.stringify(err));
                            });
                    } else if (!event.timer_exists && event.timer_id !== undefined) {
                        log.dbg('Delete timer for ' + event.title);

                        rest.del(restful + '/timers/' + event.timer_id).on('success', function (data) {
                            event.timer_exists = false;
                            event.timer_id = undefined;

                            events.update({_id: event._id}, {$unset: {timer_id: 1}, timer_active: false, timer_exists: false}, {upsert: true}, function () {
                                console.log(arguments);
                            });
                            cb(event);
                        }).on('error', function (err) {
                                log.err('Error deleting timer: ' + JSON.stringify(err));
                            }).on('403', function (err) {
                                log.err('Error deleting timer: ' + JSON.stringify(err));
                            });
                    }
                }
            });
        }
    }
};

module.exports = EventModel;