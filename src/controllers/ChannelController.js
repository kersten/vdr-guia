var channels = mongoose.model('Channel');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        data = data.data;

        var query = channels.find({});

        if (data !== undefined && data.limit !== undefined) {
            var start = data.page * data.limit - data.limit;

            query.skip(start);
            query.limit(data.limit);
        }

        query.sort('number', 1);

        query.exec(function (err, docs) {
            callback(docs);
        });
    });
});