io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        data = data.data;
        
        rest.get(vdr.restful + '/channels.json?start=0&limit=' + data.limit).on('success', function(data) {
            callback(data.channels);
        });
    });
});