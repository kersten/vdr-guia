var events = mongoose.model('Event');
var actors = mongoose.model('ActorDetail');
var movies = mongoose.model('MovieDetail');
var async = require('async');

io.sockets.on('connection', function (socket) {
    socket.on('Searchresult:read', function (data, callback) {
        data = data.data;

        var result = {
            events: {}
        };

        async.parallel([
            function (callback) {
                var i = 0;
                var query = events.find({title: new RegExp(data.query, "ig")});

                query.sort('start', 1);
                query.populate('channel_id');
                query.populate('tmdbId');

                query.exec(function (err, docs) {
                    docs.forEach(function (doc) {
                        if (i == 3) {
                            return;
                        }

                        if (result.events[doc.title] === undefined) {
                            result.events[doc.title] = doc;
                            i++;
                        }
                    });

                    callback();
                });
            }, function (callback) {
                var i = 0;
                var query = actors.find({name: new RegExp(data.query, "ig")});

                query.exec(function (err, docs) {
                    docs.forEach(function (doc) {
                        if (i == 3) {
                            return;
                        }

                        if (result.actors[doc.name] === undefined) {
                            result.actors[doc.name] = doc;
                            i++;
                        }
                    });

                    callback();
                });

                callback();
            }
        ], function(err, results){
            callback(result);
        });
    });
});