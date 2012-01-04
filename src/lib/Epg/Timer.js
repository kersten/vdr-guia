var rest = require('restler');
var EventSchema = mongoose.model('Event');

function EpgTimer (restful) {
    this.restful = restful;
}

EpgTimer.prototype.refresh = function () {
    rest.get(this.restful + '/timers.json').on('success', function (res) {
        res.timers.forEach(function (timer) {
            var query = EventSchema.find({event_id: timer.event_id});
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

module.exports = EpgTimer;