io.sockets.on('connection', function (socket) {
    socket.on('RecordingCollection:read', function (data, callback) {
        var start = 0;
        
        rest.get(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20).on('success',  function (recordings) {
            callback(recordings.recordings);
        }).on('error', function (e) {
            console.log(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20);
        });
    });
});