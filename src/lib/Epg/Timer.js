var rest = require('restler'),
    log = require('node-logging'),
    mongoose = require('mongoose'),
    Configuration = mongoose.model('Configuration'),
    events = mongoose.model('Event');

function EpgTimer () {}

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
                        timer_active: timer.is_active,
                        timer_exists: timer.is_active
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
    
    rest.post(this.restful + '/timers', {
        data: {
            channel: event.channel,
            eventid: event.event_id,
            minpre: 5,
            minpost: 15
        }
    }).on('success', function (data) {
        console.log(data);
        
        events.update({_id: event._id}, {timer_active: true, timer_id: data.timers[0].id}, null, function () {
            callback(data.timers[0]);
        });
    }).on('error', function () {
        events.update({_id: event._id}, {timer_active: true}, null, function () {
            callback();
        });
    });
};

EpgTimer.prototype.del = function (event, callback) {
    log.dbg('Delete timer for event id: ' + event.event_id);
    
    if (event.timer_id != null && event.timer_id != '') {
        rest.del(this.restful + '/timers/' + event.timer_id).on('success', function () {
            events.update({_id: event._id}, {timer_active: false, timer_id: null}, null, function () {
                callback({success: true});
            });
        }).on('error', function () {
            events.update({_id: event._id}, {timer_active: false}, null, function () {
                callback();
            });
        });
    } else {
        events.update({_id: event._id}, {timer_active: false}, null, function () {
            callback();
        });
    }
};

EpgTimer.prototype.update = function (event, callback) {
    
};

module.exports = EpgTimer;