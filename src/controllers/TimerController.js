io.sockets.on('connection', function (socket) {
    socket.on('TimerCollection:read', function (data, callback) {
        data = data.data;
        var start = data.page * data.limit - data.limit;
        
        rest.get(vdr.restful + '/timers.json?start=' + start + '&limit=' + data.limit).on('success',  function (timers) {
            callback(timers.timers);
        }).on('error', function (e) {
            console.log(vdr.restful + '/timers.json?start=' + start + '&limit=' + data.limit);
        });
    });
});