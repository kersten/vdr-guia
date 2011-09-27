io.sockets.on('connection', function (socket) {
    socket.on('search', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.post(restfulUrl + '/events/search.json?start=' + start + '&limit=' + config.app.entries, {
            data: {
                query: data.term,
                mode: 0,
                channelid: 0,
                use_title: true,
                use_subtitle: data.subtitle,
                use_description: data.description
            }
        }).on('success', function(data) {
            console.log(data);

            for (var i in data.events) {
                var start = new Date(data.events[i].start_time * 1000);
                var stop = new Date((data.events[i].start_time + data.events[i].duration) * 1000);

                data.events[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                data.events[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

                data.events[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }

            socket.emit('searchResult', {
                events: data.events
            });
        }).on('error', function () {
            socket.emit('searchResult', {
                events: []
            });
        });
    });
});