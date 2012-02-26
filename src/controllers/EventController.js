var Epg = require('../lib/Epg');
var events = mongoose.model('Event');

io.sockets.on('connection', function (socket) {
    socket.on('EventCollection:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
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
        epg.getEventsRange(data.channel_id, starttime, stoptime, callback);
    });

    socket.on('EventModel:read', function (data, callback) {
        var epg = new Epg();
        epg.getEvent(data._id, callback);
    });

    socket.on('Event:readOne', function (data, callback) {
        rest.get(vdr.restful + '/events/' + data.channel_id + '/' +  + data.event_id + '.json').on('success', function (data) {
            callback(data.events[0]);
        }).on('error', function () {
        }).on('403', function () {
        });
    });

    socket.on('EventModel:update', function (data, callback) {
        var event = data.model;

        if (event.timer_exists) {
            log.dbg('Create timer for ' + event.title);

            rest.post(vdr.restful + '/timers', {
                data: {
                    channel: event.channel,
                    eventid: event.event_id,
                    minpre: 5,
                    minpost: 15
                }
            }).on('success', function (data) {
                event.timer_exists = true;
                event.timer_id = data.timers[0].id;

                events.update({_id: event._id}, {timer_exists: true, timer_id: data.timers[0].id}, {upsert: true});

                callback(event);
            }).on('error', function () {
            }).on('403', function () {
            });
        } else if (!event.timer_exists && event.timer_id !== undefined) {
            log.dbg('Delete timer for ' + event.title);

            rest.del(vdr.restful + '/timers/' + event.timer_id).on('success', function (data) {
                event.timer_exists = false;
                event.timer_id = undefined;

                events.update({_id: event._id}, {$unset: {timer_id: 1}, timer_active: false, timer_exists: false}, {upsert: true});
                callback(event);
            }).on('error', function () {
            }).on('403', function (e) {

            });
        }
    });
});