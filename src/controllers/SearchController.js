io.sockets.on('connection', function (socket) {
    socket.on('SearchresultCollection:read', function (data, callback) {
        var start = 0;
        
        rest.post(vdr.restful + '/events/search.json?start=' + start + '&limit=' + 20, {
            data: {
                query: data.term,
                mode: 0,
                channelid: 0,
                use_title: true,
                use_subtitle: false,
                use_description: false
            }
        }).on('success',  function (epg) {
            callback(epg.events);
        }).on('error', function (e) {
            console.log(vdr.restful + '/events/search.json?start=' + start + '&limit=' + 20);
        });
    });
});