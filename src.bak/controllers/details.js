io.sockets.on('connection', function (socket) {
    socket.on('getDetails', function (data) {
        rest.get(restfulUrl + '/events/' + data.channelid + '/' + data.eventid + '.json').on('success', function(data) {
            console.log(data);
            socket.emit('getDetails', data);
        });
    });
});

module.exports = {
    index: function (req, res) {
        var eventId = req.param("eventid", false);
        var channelId = req.param("channelid", false);

        if (!eventId || !channelId) {
            res.end();
            return;
        }

        rest.get(restfulUrl + '/events/' + channelId + '/' + eventId + '.json').on('success', function(data) {
            console.log(data);

            res.render('details', {
                layout: false,
                global: {
                    title: 'Details on ' + data.events[0].title,
                    loggedIn: req.session.loggedIn
                },
                broadcast: data.events[0]
            });
        });
    }
};
