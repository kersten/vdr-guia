io.sockets.on('connection', function (socket) {
    socket.on('getTimers', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            for (var i in data.timers) {
                var start = new Date(data.timers[i].start_timestamp);
                var stop = new Date(data.timers[i].stop_timestamp);

                data.timers[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                data.timers[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

                data.timers[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }

            socket.emit('getTimers', {
                timers: data.timers
            });
        });
    });

    socket.on('createTimer', function (data) {
        data = JSON.stringify(data);

        rest.post(restfulUrl + '/timers',{data: data}).on('complete', function (data) {
            socket.emit('timerCreated', data.timers[0]);
        }).on('error', function (e) {
            console.log(e);
        }).on('403', function (e) {
            console.log(e);
        });
    });

    socket.on('deleteTimer', function (data) {
        rest.del(restfulUrl + '/timers/' + data.timerId).on('complete', function () {
            socket.emit('timerDeleted');
        }).on('error', function (e) {
            console.log(e);
        }).on('403', function (e) {
            console.log(e);
        });
    });
});