var Channel = require('../lib/Channel'),
    Epg = require('../lib/Epg');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        console.log(data);
        
        if (!socket.handshake.session.loggedIn && data.install === undefined) {
            return false;
        }

        var channels = new Channel();
        var options = data;

        channels.getAll(options, function (channels) {
            callback(channels);
        });
    });
});