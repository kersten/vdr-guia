var Channel = require('../lib/Channel');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        if (socket.handshake.session.loggedIn) {
            return false;
        }
        
        var channels = new Channel();
        var options = data;

        channels.getAll(options, function (channels) {
            callback(channels);
        });
    });
});