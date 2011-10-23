io.sockets.on('connection', function (socket) {
    socket.on('EventCollection:read', function (data, callback) {
        data = data.data;
        var start = 0;
        
        rest.get(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20).on('success',  function (epg) {
            callback(epg.events);
        }).on('error', function (e) {
            callback({error: 'No events found'});
            console.log(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20);
        });
    });
    
    socket.on('Event:record', function (data, callback) {
        rest.post(vdr.restful + '/timers', {
            data: JSON.stringify({
                channel: data.channel_id,
                eventid: data.event_id,
                minpre: 5,
                minpost: 15
            })
        }).on('success', function (data) {
            callback(data.timers[0]);
        }).on('error', function () {
            console.log('error: ' + vdr.restful + '/timers');
        }).on('403', function () {
            console.log('403: ' + vdr.restful + '/timers');
        });
    });
});