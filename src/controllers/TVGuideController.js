io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:read', function (data, callback) {
        data = data.data;
        var start = (data.page -1) * 3;
        var limit = start + 3;
        
        rest.get(vdr.restful + '/channels.json?start=' + start + '&limit=' + limit).on('success', function(data) {
            console.log(data.channels);
            callback(data.channels);
        });
        
        /*rest.get(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20).on('success',  function (epg) {
            callback(epg.events);
        }).on('error', function (e) {
            callback({error: 'No events found'});
            console.log(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20);
        });*/
    });
});