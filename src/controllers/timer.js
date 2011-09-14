io.sockets.on('connection', function (socket) {
    socket.on('getTimers', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            console.log(data);

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

        rest.post(restfulUrl + '/timers',{data: data}).on('complete', function () {
            socket.emit('timerCreated');
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

module.exports = {
    index: function (req, res) {
        var start = (req.param("site", 1) - 1) * config.app.entries;

        rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            var sorted = new Array();

            for (i in data.timers) {
                sorted[data.timers[i].day + '' +data.timers[i].start] = data.timers[i];
            }

            sorted = ksort(sorted);

            data.timers = new Array();

            for (i in sorted) {
                data.timers.push(sorted[i]);
            }

            res.render('timer', {
                layout: false,
                global: {
                    title: 'Timer',
                    loggedIn: req.session.loggedIn,
                    maxEntries: config.app.entries
                },
                timers: data.timers,
                paginator: {
                    total: data.total,
                    cur: parseInt(req.param("site", 1)),
                    sites: Math.floor(data.total / config.app.entries),
                    next: parseInt(req.param("site", 1)) + 1,
                    previous: parseInt(req.param("site", 1)) -1
                },
                restfulUrl: restfulUrl
            });
        });
    }
};