io.sockets.on('connection', function (socket) {
    socket.on('getSearchtimers', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/searchtimers.json?start=' + start + '&limit=' + config.app.entries).on('success', function(data) {
            var sorted = new Array();

            for (i in data.searchtimers) {
                if (typeof(data.searchtimers[i].start_time) != 'undefined') {
                    // 2000
                    switch (data.searchtimers[i].start_time.toString().length) {
                    case 1:
                        data.searchtimers[i].start_time = '00:00';
                        break;

                    case 3:
                        data.searchtimers[i].start_time = '0' + data.searchtimers[i].start_time;
                        data.searchtimers[i].start_time = data.searchtimers[i].start_time.toString().substr(0, 2) + ':' + data.searchtimers[i].start_time.toString().substr(2,2);
                        break;
                    
                    case 4:
                        data.searchtimers[i].start_time = data.searchtimers[i].start_time.toString().substr(0, 2) + ':' + data.searchtimers[i].start_time.toString().substr(2,2);
                        break;
                    }
                }
                
                if (typeof(data.searchtimers[i].stop_time) != 'undefined') {
                    // 2000
                    switch (data.searchtimers[i].stop_time.toString().length) {
                    case 1:
                        data.searchtimers[i].stop_time = '00:00';
                        break;
                    
                    case 3:
                        data.searchtimers[i].stop_time = '0' + data.searchtimers[i].stop_time;
                        data.searchtimers[i].stop_time = data.searchtimers[i].stop_time.toString().substr(0, 2) + ':' + data.searchtimers[i].stop_time.toString().substr(2,2);
                        break;
                    
                    case 4:
                        data.searchtimers[i].stop_time = data.searchtimers[i].stop_time.toString().substr(0, 2) + ':' + data.searchtimers[i].stop_time.toString().substr(2,2);
                        break;
                    }
                }
                
                sorted[data.searchtimers[i].id] = data.searchtimers[i];
            }

            sorted = ksort(sorted);

            data.searchtimers = new Array();

            for (i in sorted) {
                data.searchtimers.push(sorted[i]);
            }
            
            socket.emit('getSearchtimers', data.searchtimers);
        });
        
    });
});