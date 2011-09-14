io.sockets.on('connection', function (socket) {
    socket.on('getRecordings', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/recordings.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            console.log(data);

            for (var i in data.recordings) {
                var start = new Date(data.recordings[i].event_start_time * 1000);
                var stop = new Date((data.recordings[i].event_start_time + data.recordings[i].event_duration) * 1000);

                data.recordings[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                data.recordings[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

                data.recordings[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }

            socket.emit('getRecordings', {
                recordings: data.recordings
            });
        });
    });
    
    socket.on('deleteRecording', function (data) {
        console.log(restfulUrl + '/recordings/' + data.number);
        
        rest.del(restfulUrl + '/recordings/' + data.number).on('complete', function () {
            socket.emit('recordingDeleted');
        });
    });
});