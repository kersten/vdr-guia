var async = require('async');
var channels = mongoose.model('Channel');
var events = mongoose.model('Event');
var movies = mongoose.model('MovieDetail');

/*
 * events: create read update delete
 */

io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }

        var page = data.page - 1 || 0;
        var start = page * 4;

        var channelQuery = channels.find({});

        channelQuery.where('active', true);
        channelQuery.sort('number', 1);
        channelQuery.skip(start);
        channelQuery.limit(4);

        channelQuery.run(function (err, channels) {
            callback(channels);
        });
    });
});