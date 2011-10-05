io.sockets.on('connection', function (socket) {
    socket.on('EventCollection:read', function (data) {
        console.log(data);
        /*rest.get(vdr.restful + '/channels.json?start=0').on('success', function(data) {
            
            
            socket.emit('EventCollection:read', {channels: data.channels});
        });*/
    });
});