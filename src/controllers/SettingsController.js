var channels = mongoose.model('Channel');

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
            var values = null;

            switch (data.key) {
                case 'epgscandelay':
                    values = {
                        epgscandelay: data.value
                    };
                    break;

                case 'fetchTmdbMovies':
                    values = {
                        fetchTmdbMovies: data.value
                    };
                    break;

                case 'fetchTmdbActors':
                    values = {
                        fetchTmdbActors: data.value
                    };
                    break;

               case 'fetchThetvdbSeasons':
                    values = {
                        fetchThetvdbSeasons: data.value
                    };
                    break;
            }

            if (values != null) {
                config.update({_id: doc._id}, values, false, function () {
                    callback({success: true});
                });
            } else {
                callback({success: false});
            }
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