var async = require('async');
var channels = mongoose.model('Channel');
var events = mongoose.model('Event');
var movies = mongoose.model('MovieDetail');

/*
 * events: create read update delete
 */

io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:create', function (data, callback) {
        
    });
    
    socket.on('TVGuideCollection:read', function (data, callback) {
        var page = data.page -1 || 0;
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
    
    socket.on('TVGuideCollection:update', function (data, callback) {
        
    });
    
    socket.on('TVGuideCollection:delete', function (data, callback) {
        
    });
});
/*
io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:read', function (data, callback) {
        console.log(data);
        
        data = data.data;
        
        var guideResults = new Array();
        var start = (data.page -1) * 4;
        var date = new Date();
        
        date.setFullYear(
            parseInt(data.date.year, 10),
            parseInt(data.date.month, 10) -1,
            parseInt(data.date.day, 10)
        );

        var primetime = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate()) + ' 20:13:00');
        primetime = primetime.getTime() / 1000;

        date = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 > 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() > 10) ? '0' + date.getDate() : date.getDate()) + ' 05:00:00');

        var starttime = date;
        starttime = starttime.getTime() / 1000;

        if (date.getHours() > 6) {
            starttime -= 86400;
            primetime -= 86400;
        }

        var stoptime = starttime + 86400;

        // Select three channels
        var channelQuery = channels.find({});

        channelQuery.where('active', true);
        channelQuery.sort('number', 1);
        channelQuery.skip(start);
        channelQuery.limit(4);

        channelQuery.each(function (err, doc, next) {
            if (doc == null) {
                callback(guideResults);
                return;
            }

            var result = {
                channel_name: doc.name,
                channel_id: doc._id,
                primetime: {},
                events: {}
            };

            var primetimeQuery = events.findOne({});

            primetimeQuery.where('channel_id', doc._id);
            primetimeQuery.where('start').gte(primetime);
            primetimeQuery.sort('start', 1);

            primetimeQuery.run(function (err, doc) {
                if (doc == null) {
                    fetchEpg(result.channel_id, result, next);
                    return;
                }
                
                var start_time = new Date();
                start_time.setTime(doc.start * 1000);

                doc.start_time = start_time.getHours() + ':' + start_time.getMinutes();

                result.primetime.event = doc;

                if (result.primetime.event.get('category') != null && result.primetime.event.get('category').match(/film/)) {
                    movies.findOne({epg_name: doc.title}, function (err, doc) {
                        if (doc == null) {
                            fetchEpg(result.channel_id, result, next);
                            return;
                        }

                        result.primetime.tmdb = doc;

                        if (doc.get('backdrops') != null) {
                            doc.get('backdrops').forEach(function (drop) {
                                if (drop.image.size == 'thumb') {
                                    result.primetime.image = drop.image.url;
                                    return
                                }
                            });
                        }

                        if (result.primetime.image === undefined && doc.get('posters') != null) {
                            doc.get('posters').forEach(function (poster) {
                                if (poster.image.size == 'thumb') {
                                    result.primetime.image = poster.image.url;
                                    return
                                }
                            });
                        }

                        fetchEpg(result.channel_id, result, next);
                    });
                } else {
                    fetchEpg(result.channel_id, result, next);
                }
            });
        });

        function fetchEpg (channel_id, result, next) {
            var eventsObj = {};

            var eventsQuery = events.find({});

            eventsQuery.where('channel_id', channel_id);
            eventsQuery.where('start').gte(starttime).lt(stoptime);
            eventsQuery.sort('start', 1);

            eventsQuery.each(function (err, doc, callback) {
                if (doc == null) {
                    result.events = eventsObj;

                    guideResults.push(result);

                    next(null, null);
                    return;
                }

                var date = new Date();
                date.setTime(doc.start * 1000);

                doc.start_time = ((date.getHours() < 10) ? '0' + date.getHours() : date.getHours()) + ':' + ((date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes());

                if (eventsObj[date.getDate() + ':' + date.getHours()] === undefined) {
                    eventsObj[date.getDate() + ':' + date.getHours()] = new Array();
                }

                eventsObj[date.getDate() + ':' + date.getHours()].push(doc);

                callback(null, null);
            });
        }
    });
});*/