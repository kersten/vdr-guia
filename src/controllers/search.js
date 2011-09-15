io.sockets.on('connection', function (socket) {
    socket.on('search', function (data) {
        var start = (data.site - 1) * config.app.entries;

        rest.post(restfulUrl + '/events/search.json?start=' + start + '&limit=' + config.app.entries, {
            data: {
                query: data.term,
                mode: 0,
                channelid: 0,
                use_title: true,
                use_subtitle: data.subtitle,
                use_description: data.description
            }
        }).on('complete', function(data) {
            console.log(data);

            for (var i in data.events) {
                var start = new Date(data.events[i].start_time * 1000);
                var stop = new Date((data.events[i].start_time + data.events[i].duration) * 1000);

                data.events[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                data.events[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

                data.events[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }

            socket.emit('searchResult', {
                events: data.events
            });
        }).on('error', function () {
            socket.emit('searchResult', {
                events: []
            });
        });
    });
});

module.exports = {
    index: function (req, res) {
        if (req.param("q", "") != "") {
            var start = req.param("site", 1) * config.app.entries;

            rest.post(restfulUrl + '/events/search.json?start=' + start + '&limit=' + config.app.entries, {
                data: {
                    query: req.param("q"),
                    mode: 0,
                    channelid: 0,
                    use_title: true,
                    use_subtitle: (req.param("s", false) != false) ? true : false,
                    use_description: (req.param("d", false) != false) ? true : false
                }
            }).on('complete', function(data) {
                console.log(data);

                res.render('search', {
                    layout: false,
                    global: {
                        title: 'Search',
                        loggedIn: req.session.loggedIn,
                        maxEntries: config.app.entries
                    },
                    results: data.events,
                    paginator: {
                        total: data.total,
                        cur: parseInt(req.param("site", 1)),
                        sites: Math.floor(data.total / config.app.entries),
                        next: parseInt(req.param("site", 1)) + 1,
                        previous: parseInt(req.param("site", 1)) -1
                    },
                    q: req.param("q", ""),
                    s: req.param("s", ""),
                    d: req.param("d", "")
                });
            });
        } else {
            res.render('search', {
                layout: false,
                global: {
                    title: 'Search',
                    loggedIn: req.session.loggedIn,
                    page: 'search'
                },
                q: req.param("q", ""),
                s: req.param("s", ""),
                d: req.param("d", "")
            });
        }
    }
};