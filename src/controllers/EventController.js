io.sockets.on('connection', function (socket) {
    socket.on('EventCollection:read', function (data, callback) {
        data = data.data;
        var start = (data.page - 1) * 20;
        
        rest.get(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20).on('success',  function (epg) {
            callback(epg.events);
        }).on('error', function (e) {
            callback({error: 'No events found'});
            console.log(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20);
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