var async = require('async');
var channels = mongoose.model('Channel');
var events = mongoose.model('Event');

io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:read', function (data, callback) {
        data = data.data;

        var guideResults = new Array();

        var start = (data.page -1) * 3;

        var date = new Date();
        var primetime = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 > 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() > 10) ? '0' + date.getDate() : date.getDate()) + ' 20:13:00');

        date = new Date(date.getFullYear() + '-' + ((date.getMonth() + 1 > 10) ? '0' + (date.getMonth() + 1) : (date.getMonth()) + 1) + '-' + ((date.getDate() > 10) ? '0' + date.getDate() : date.getDate()) + ' 05:00:00');

        var starttime = date;
        starttime = starttime.getTime() / 1000;

        var stoptime = starttime + 86400;

        // Select three channels
        var channelQuery = channels.find({});

        channelQuery.where('active', true);
        channelQuery.sort('number', 1);
        channelQuery.skip(start);
        channelQuery.limit(3);

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
            primetimeQuery.where('start').gte(primetime.getTime() / 1000);
            primetimeQuery.sort('start', 1);

            primetimeQuery.run(function (err, doc) {
                var start_time = new Date();
                start_time.setTime(doc.start * 1000);

                doc.start_time = start_time.getHours() + ':' + start_time.getMinutes();

                result.primetime = doc;

                fetchEpg(result.channel_id, result, next);
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

                if (eventsObj[date.getDate() + ':' + date.getHours()] === undefined) {
                    eventsObj[date.getDate() + ':' + date.getHours()] = new Array();
                }

                eventsObj[date.getDate() + ':' + date.getHours()].push(doc);

                callback(null, null);
            });
        }
    });
});