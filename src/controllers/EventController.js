var Epg = require('../lib/Epg');

io.sockets.on('connection', function (socket) {
    socket.on('EventCollection:read', function (data, callback) {
        var start = (data.data.page - 1) * 20;

        var epg = new Epg();
        epg.getEvents(data.data.channel_id, start, 20, callback);
    });

    socket.on('EventModel:read', function (data, callback) {
        var epg = new Epg();
        epg.getEvent(data.data._id, callback);
    });

    socket.on('Event:readOne', function (data, callback) {
        rest.get(vdr.restful + '/events/' + data.channel_id + '/' +  + data.event_id + '.json').on('success', function (data) {
            callback(data.events[0]);
        }).on('error', function () {
        }).on('403', function () {
        });
    });

    socket.on('Event:record', function (data, callback) {
        rest.post(vdr.restful + '/timers', {
            data: {
                channel: data.channel_id,
                eventid: data.event_id,
                minpre: 5,
                minpost: 15
            }
        }).on('success', function (data) {
            callback(data.timers[0]);
        }).on('error', function () {
        }).on('403', function () {
        });
    });

    socket.on('Event:deleteTimer', function (data, callback) {
        rest.del(vdr.restful + '/timers/' + data.timer_id).on('success', function (data) {
            callback();
        }).on('error', function () {
        }).on('403', function (e) {
        });
    });
});