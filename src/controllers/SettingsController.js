var channels = mongoose.model('Channel');
var events = mongoose.model('Event');
var actors = mongoose.model('Actor');
var actorDetails = mongoose.model('ActorDetail');
var movieDetails = mongoose.model('MovieDetail');
var async = require('async');

io.sockets.on('connection', function (socket) {
    socket.on('ChannelModel:update', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
        data = data.model;

        channels.update({_id: data._id}, {active: data.active}, false, function () {
            callback({success: true});
        });
    });

    socket.on('Configuration:create', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
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
                
                case 'vdrHost':
                    values = {
                        vdrHost: data.value
                    };
                    break;
                        
                case 'restfulPort':
                    values = {
                        restfulPort: data.value
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
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
        var config = mongoose.model('Configuration');
        config.findOne({}, function (err, doc) {
            if (doc.epgscandelay === undefined) {
                callback({success: true});
            } else {
                callback({success: true, data: {value: doc.epgscandelay}});
            }
        });
    });

    socket.on('DatabaseStatistics:fetch', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
        async.parallel([
            function (callback) {
                mongoose.connection.db.executeDbCommand({dbstats: 1}, function(err, result) {
                    if (err == null) {
                        callback(null, {dbstats: result.documents[0]});
                    } else {
                        callback();
                    }
                });
            }, function (callback) {
                mongoose.connection.db.executeDbCommand({collstats: 'channels'}, function(err, result) {
                    if (err == null) {
                        callback(null, {channelStats: result.documents[0]});
                    } else {
                        log.err('Querying stats faild: ' + err);
                        callback();
                    }
                });
            }, function (callback) {
                mongoose.connection.db.executeDbCommand({collstats: 'events'}, function(err, result) {
                    if (err == null) {
                        callback(null, {eventStats: result.documents[0]});
                    } else {
                        log.err('Querying stats faild: ' + err);
                        callback();
                    }
                });
            }, function (callback) {
                mongoose.connection.db.executeDbCommand({collstats: 'actors'}, function(err, result) {
                    if (err == null) {
                        callback(null, {actorStats: result.documents[0]});
                    } else {
                        log.err('Querying stats faild: ' + err);
                        callback();
                    }
                });
            }, function (callback) {
                mongoose.connection.db.executeDbCommand({collstats: 'actordetails'}, function(err, result) {
                    if (err == null) {
                        callback(null, {actorDetailStats: result.documents[0]});
                    } else {
                        log.err('Querying stats faild: ' + err);
                        callback();
                    }
                });
            }, function (callback) {
                mongoose.connection.db.executeDbCommand({collstats: 'moviedetails'}, function(err, result) {
                    if (err == null) {
                        callback(null, {movieDetailStats: result.documents[0]});
                    } else {
                        log.err('Querying stats faild: ' + err);
                        callback();
                    }
                });
            }
        ], function (err, results) {
            var stats = {};

            results.forEach(function (result) {
                for (var key in result) {
                    stats[key] = result[key];
                }
            });

            callback({success: true, data: stats});
        });
    });

    socket.on('Database:reset', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }
        
        if (data.database === undefined && data.events === true) {
            events.collection.drop();
            actors.collection.drop();
            actorDetails.collection.drop();
            movieDetails.collection.drop();
        }

        if (data.database === true && data.events === undefined) {
            channels.collection.drop();
            events.collection.drop();
            actors.collection.drop();
            actorDetails.collection.drop();
            movieDetails.collection.drop();
        }

        callback({success: true});
    });
});