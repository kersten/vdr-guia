var events = mongoose.model('Event');
var actors = mongoose.model('Actor');
var async = require('async');

io.sockets.on('connection', function (socket) {
    socket.on('Searchresult:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
        data = data.data;

        var result = {
            events: {},
            actors: {}
        };

        log.dbg('Search for: ' + data.query);

        async.parallel([
            function (callback) {
                var i = 0;
                var query = events.find({title: new RegExp(data.query, "ig")});

                query.sort('start', 1);
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
                var query = actors.find();

                query.or([{name: new RegExp(data.query, "ig")}, {character: new RegExp(data.query, "ig")}]);
                query.populate('tmdbId');

                query.exec(function (err, docs) {
                    console.log(arguments);

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
            }
        ], function(err, results){
            callback(result);
        });
    });
});