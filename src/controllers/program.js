io.sockets.on('connection', function (socket) {
    socket.on('getChannels', function () {
        rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
            socket.emit('getChannels', data.channels);
        });
    });
    
    socket.on('getEpg', function (data) {
        var start = (data.site - 1) * config.app.entries;
        
        rest.get(restfulUrl + '/events/' + data.channelid + '.json?timespan=0&start=' + start + '&limit=' + config.app.entries).on('complete',  function (epg) {
            socket.emit('getEpg', {
                channelEpg: epg.events,
                paginator: {
                    total: epg.total,
                    cur: data.site,
                    sites: Math.floor(epg.total / config.app.entries),
                    next: data.site + 1,
                    previous: data.site -1
                },
                maxEntries: config.app.entries,
                switchUrl: restfulUrl + '/remote/switch',
                restfulUrl: restfulUrl
            });
        }).on('error', function () {
            //syslog.log(syslog.LOG_ERR, 'Error getting epg for channel ' + chan);
        });
    });
});

module.exports = {
    index: function (req, res) {
        rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
            res.render('program', {
                layout: false,
                global: {
                    title: 'Program',
                    loggedIn: req.session.loggedIn,
                    maxEntries: config.app.entries
                },
                channels: data.channels,
                paginator: {
                    total: 0
                },
                switchUrl: restfulUrl + '/remote/switch',
                restfulUrl: restfulUrl
            });
        });
    },
    channellist: function (req, res) {
        rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
            res.render('program/channels', {
                layout: false,
                channels: data.channels
            });
        });
    },
    view: function (req, res) {
        var start = (req.param("site", 1) - 1) * config.app.entries;

        rest.get(restfulUrl + '/channels/' + req.params.channelid + '.json?start=0&limit=1').on('complete', function(channel) {
            rest.get(restfulUrl + '/events/' + req.params.channelid + '.json?timespan=0&start=' + start + '&limit=' + config.app.entries).on('complete',  function (epg) {
                res.render('program/epg', {
                    layout: false,
                    global: {
                        title: 'Program',
                        loggedIn: req.session.loggedIn,
                        page: 'program',
                        maxEntries: config.app.entries
                    },
                    channelEpg: epg.events,
                    channel: channel.channels[0],
                    paginator: {
                        total: epg.total,
                        cur: parseInt(req.param("site", 1)),
                        sites: Math.floor(epg.total / config.app.entries),
                        next: parseInt(req.param("site", 1)) + 1,
                        previous: parseInt(req.param("site", 1)) -1
                    },
                    switchUrl: restfulUrl + '/remote/switch',
                    restfulUrl: restfulUrl
                });
            }).on('error', function () {
                syslog.log(syslog.LOG_ERR, 'Error getting epg for channel ' + chan);
            });
        });
    }
};