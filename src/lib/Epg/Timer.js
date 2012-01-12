var rest = require('restler');
var events = mongoose.model('Event');

function EpgTimer (restful) {
    this.restful = restful;
}

EpgTimer.prototype.refresh = function () {
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
                    timer_active: timer.is_active,
                    timer_exists: timer.is_active
                });
                
                doc.save();
                
                next();
            });
        });
    }).on('error', function () {
        return;
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
        
        events.update({_id: event._id}, {timer_active: true}, null, function () {
            callback(data.events[0]);
        });
    }).on('error', function () {
        events.update({_id: event._id}, {timer_active: true}, null, function () {
            callback(data.events[0]);
        });
    });
};

EpgTimer.prototype.del = function (event, callback) {
    log.dbg('Delete timer for event id: ' + event.event_id);
    
    if (event.timer_id != null && event.timer_id != '') {
        rest.del(this.restful + '/timers/' + event.timer_id).on('success', function () {
            doc.set({timer_active: false, timer_id: null});
            doc.save(function () {
                callback({
                    data: "timerdeleted"
                });
            });
        }).on('error', function () {
            doc.set({timer_active: false});
            doc.save(function () {
                callback({
                    error: true,
                    data: "vdrnotreachable"
                });
            });
        });
    } else {
        doc.set({timer_active: false});
        doc.save(function () {
            callback({
                data: "timerdeleted"
            });
        });
    }
};

EpgTimer.prototype.update = function (event, callback) {
    
};

module.exports = EpgTimer;