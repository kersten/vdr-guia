io.sockets.on('connection', function (socket) {
    socket.on('getChannels', function () {
        console.log(vdr);
        socket.emit('getChannels', vdr.channelList);
    });

    socket.on('getEpg', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/events/' + data.channelid + '.json?timespan=0&start=' + start + '&limit=' + config.app.entries).on('complete',  function (epg) {
            for (var i in epg.events) {
                var start = new Date(epg.events[i].start_time * 1000);
                var stop = new Date((epg.events[i].start_time + epg.events[i].duration) * 1000);

                epg.events[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                epg.events[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

                epg.events[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }

            socket.emit('getEpg', {
                channelEpg: epg.events
            });
        }).on('error', function () {
            //syslog.log(syslog.LOG_ERR, 'Error getting epg for channel ' + chan);
        });
    });
});