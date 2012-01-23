io.sockets.on('connection', function (socket) {
    socket.on('TimerCollection:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }

        data = data.data;
        var start = data.page * data.limit - data.limit;

        rest.get(vdr.restful + '/timers.json?start=' + start + '&limit=' + data.limit).on('success',  function (timers) {
            callback(timers.timers);
        }).on('error', function (e) {
            log.dbg(vdr.restful + '/timers.json?start=' + start + '&limit=' + data.limit);
        });
    });

    socket.on('EventModel:create', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }

        console.log(data);

        var event = data.model;
        var timer = new EpgTimer(vdr.restful);

        if (event.timer_active === true) {
            timer.create(event, function () {
                callback();
            });
        } else if (event.timer_active === false) {
            timer.del(event, function () {
                callback();
            });
        }
    });
});