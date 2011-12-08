var async = require('async');

io.sockets.on('connection', function (socket) {
    socket.on('TVGuideCollection:read', function (data, callback) {
        data = data.data;
        var start = (data.page -1) * 3;
        var limit = start + 3;
        
        // Primetime
        var primetime = new Date();
        primetime.setHours(20,10);
        primetime = Math.round(primetime.getTime() / 1000);
        
        rest.get(vdr.restful + '/channels.json?start=' + start + '&limit=' + limit).on('success', function(data) {
            console.log(data.channels);
            
            async.map(data.channels, function (event, callback) {
                rest.get(vdr.restful + '/events/' + event.channel_id + '.json?from=' + primetime + '&start=0&limit=1').on('success', function(data) {
                    var result = {};
                    result[data.events[0].channel] = data.events[0];
                    
                    var startDay = new Date();
                    startDay.setHours(5,00);
                    startDay = Math.round(startDay.getTime() / 1000);
                    
                    rest.get(vdr.restful + '/events/' + event.channel_id + '.json?from=' + startDay + '&start=0&timespan=86400').on('success', function(data) {
                        callback(null, {primetime: result, events: data.events});
                    });
                    //callback(null, result);
                });
            }, function (err, results) {
                callback(results);
            });
        });
        
        /*rest.get(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20).on('success',  function (epg) {
            callback(epg.events);
        }).on('error', function (e) {
            callback({error: 'No events found'});
            console.log(vdr.restful + '/events/' + data.channel_id + '.json?timespan=0&start=' + start + '&limit=' + 20);
        });*/
    });
});