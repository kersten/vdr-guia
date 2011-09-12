io.sockets.on('connection', function (socket) {
    socket.on('getTimers', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            console.log(data);

            for (var i in data.timers) {
                data.timers[i].start = data.timers[i].start.toString().substring(0, 2) + ':' + data.timers[i].start.toString().substring(2, 4);
                data.timers[i].stop = data.timers[i].stop.toString().substring(0, 2) + ':' + data.timers[i].stop.toString().substring(2, 4);

                // 2011-09-11
                data.timers[i].day = data.timers[i].day.substring(8, 10) + '.' + data.timers[i].day.substring(5, 7);
            }

            socket.emit('getTimers', {
                timers: data.timers
            });
        });
    });

    socket.on('createTimer', function (data) {
        console.log('Create Timer');
        console.log(data);

        rest.post(restfulUrl + '/timers', data).on('complete', function () {
            socket.emit('timerCreated');

            rest.get(restfulUrl + '/timers.json').on('complete', function (data) {
                console.log(data);
            })
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