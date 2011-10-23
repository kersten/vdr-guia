io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        data = data.data;
        
        var start = data.page * data.limit - data.limit;
        
        rest.get(vdr.restful + '/channels.json?start=' + start + '&limit=' + data.limit).on('success', function(data) {
            callback(data.channels);
        });
    });
});