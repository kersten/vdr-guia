var channels = mongoose.model('Channel');
var events = mongoose.model('Event');
var actors = mongoose.model('Actor');
var actorDetails = mongoose.model('ActorDetail');
var movieDetails = mongoose.model('MovieDetail');
var async = require('async');
var Recaptcha = require('recaptcha').Recaptcha;

var PUBLIC_KEY  = '6LffpMsSAAAAABZxRaS3M_M-5YThDrD6p5aXROnl',
    PRIVATE_KEY = '6LffpMsSAAAAAEgqnxpgsnDhmRj4Ty1wCJBsfHga';

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
    
    socket.on('DatabaseStatistics:fetch', function (data, callback) {
        console.log(JSON.stringify(channels.find()));
        
        async.parallel([
            function (callback) {
                //console.log(channels);
                /*channels.statics(function () {
                    callback();
                });*/
            }, function (callback) {
                //console.log(events.statics);
                /*events.statics(function () {
                    callback();
                });*/
            }
        ], function(err, results){
            callback({success: true});
        });
    });
    
    socket.on('Database:reset', function (data, callback) {
        var recaptcha = new Recaptcha(PUBLIC_KEY, PRIVATE_KEY, true);
        callback({success: true, html: recaptcha.toHTML()});
    });
});