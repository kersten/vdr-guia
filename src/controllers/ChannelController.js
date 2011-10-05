io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function () {
        rest.get(vdr.restful + '/channels.json?start=0').on('success', function(data) {
            socket.emit('ChannelCollection:read', {channels: data.channels});
        });
    });
});