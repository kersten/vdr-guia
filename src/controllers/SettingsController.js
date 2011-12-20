io.sockets.on('connection', function (socket) {
    socket.on('ChannelModel:create', function (data, callback) {
        data = data.model;

        channels.update({_id: data._id}, {active: data.active}, false, function () {
            callback({success: true});
        });
    });

    socket.on('Configuration:create', function (data, callback) {
        var config = mongoose.model('Configuration');
        config.findOne({}, function (err, doc) {
            config.update({_id: doc._id}, {epgscandelay: data.syncdelay}, false, function () {
                callback({success: true});
            });
        });
    });

    socket.on('Configuration:fetch', function (data, callback) {
        var config = mongoose.model('Configuration');
        config.findOne({}, function (err, doc) {
            if (doc.epgscandelay === undefined) {
                callback({success: true});
            } else {
                callback({success: true, data: {value: doc.epgscandelay}});
            }
        });
    });
});