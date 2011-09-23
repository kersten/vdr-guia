io.sockets.on('connection', function (socket) {
    socket.on('getSearchtimers', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.get(restfulUrl + '/searchtimers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            var sorted = new Array();

            for (i in data.searchtimers) {
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