var async = require('async');
var Epg = require('../lib/Epg');
var EpgTimer = require('../lib/Epg/Timer');

io.sockets.on('connection', function (socket) {
    socket.on('TimerCollection:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }

        rest.get(vdr.restful + '/timers.json').on('success',  function (timers) {
            var EpgEvent = new Epg();
            var result = [];

            async.map(timers.timers, function (timer, callback) {
                EpgEvent.getEventById(timer.event_id, timer.channel, function (event) {
                    result.push(event);
                    callback(null);
                });
            }, function () {
                callback(result);
            });
        }).on('error', function (e) {

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