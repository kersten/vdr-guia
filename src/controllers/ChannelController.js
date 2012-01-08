var channels = mongoose.model('Channel');
var Channel = require('../lib/Channel');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        var channel = new Channel();

        if (data.install !== undefined) {
            var ChannelImport = require('../lib/Channel/Import');
            var channelImporter = new ChannelImport(data.restful);

            channelImporter.start(function () {
                channel.getAll(function (channels) {
                    callback(channels);
                });
            });
        } else {
            channel.getAll(function (channels) {
                callback(channels);
            });
        }

        var query = channels.find({});

        if (data !== undefined && data.limit !== undefined) {
            var start = data.page * data.limit - data.limit;

            query.skip(start);
            query.limit(data.limit);
        }

        if (data !== undefined && data.active !== undefined) {
            query.where('active', true);
        }

        query.sort('number', 1);

        query.exec(function (err, docs) {
            callback(docs);
        });
    });
});