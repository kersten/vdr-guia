var channels = mongoose.model('Channel');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelCollection:read', function (data, callback) {
        data = data.data;
        
        var start = data.page * data.limit - data.limit;
        
        var query = channels.find({});
        
        console.log(data);
        
        query.skip(start);
        query.limit(data.limit);
        
        query.exec(function (err, docs) {
            callback(docs);
        });
    });
});