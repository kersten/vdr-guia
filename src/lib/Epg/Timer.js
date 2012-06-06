var rest = require('restler'),
    log = require('node-logging'),
    mongoose = require('mongoose'),
    Configuration = mongoose.model('Configuration'),
    events = mongoose.model('Event');

function EpgTimer () {}


EpgTimer.prototype.getAll = function (cb) {
    "use strict";

    var query = events.find({timer_id: {$exists: true, $ne: ''}, start: {$gte: new Date().getTime() / 1000}});
    query.populate('channel_id');
    query.asc('start');

    query.run(function (err, docs) {
        cb(docs);
    });
};

EpgTimer.prototype.getRestful = function (cb) {
    var _this = this;

    Configuration.findOne({}, function (err, doc) {
        if (doc) {
            _this.restful = 'http://' + doc.get('vdrHost') + ':' + doc.get('restfulPort');
            cb.apply(_this, []);
        }
    });
};

EpgTimer.prototype.refresh = function () {
    this.getRestful(function () {
        rest.get(this.restful + '/timers.json').on('success', function (res) {
            res.timers.forEach(function (timer) {
                var query = events.find({event_id: timer.event_id});
                query.populate('channel_id', null, {channel_id: timer.channel});

                query.each(function (err, doc, next) {
                    if (doc == null) {
                        return;
                    }

                    if (err || doc.channel_id == null) {
                        next();
                        return;
                    }

                    doc.set({
                        timer_id: timer.id,
                        timer_exists: timer.is_active,
                        timer_start: timer.start_timestamp,
                        timer_stop: timer.stop_timestamp,
                        timer_filename: timer.filename
                    });

                    doc.save();

                    next();
                });
            });

            log.inf('Timer refresh finished');
        }).on('error', function () {
            log.err('Timer refresh failed');
            return;
        });
    });
};

EpgTimer.prototype.create = function (event, callback) {
    log.dbg('Create timer for event id: ' + event.event_id);

    this.getRestful(function () {
        rest.post(this.restful + '/timers', {
            data: {
                channel: event.channel,
                eventid: event.event_id,
                minpre: 5,
                minpost: 15
            }
        }).on('success', function (data) {
            event.timer_exists = true;
            event.timer_id = data.timers[0].id;

            events.update({_id: event._id}, {timer_exists: true, timer_id: data.timers[0].id}, {upsert: true}, function () {
                callback(event);
            });
        }).on('error', function () {
            callback();
        });
    });
};

EpgTimer.prototype.del = function (event, callback) {
    log.dbg('Delete timer for event id: ' + event.event_id);

    this.getRestful(function () {
        if (event.timer_id != null && event.timer_id != '') {
            rest.del(this.restful + '/timers/' + event.timer_id).on('success', function () {
                event.timer_exists = false;
                event.timer_id = undefined;

                events.update({_id: event._id}, {$unset: {timer_id: 1}, timer_exists: false}, {upsert: true}, function () {
                    callback(event);
                });
            }).on('error', function () {
                events.update({_id: event._id}, {timer_exists: false}, null, function () {
                    callback();
                });
            });
        } else {
            events.update({_id: event._id}, {timer_exists: false}, null, function () {
                callback();
            });
        }
    });
};

EpgTimer.prototype.update = function (event, callback) {
    
};

module.exports = EpgTimer;