io.sockets.on('connection', function (socket) {
    socket.on('getChannels', function () {
        rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
            socket.emit('getChannels', data.channels);
        });
    });
    
    socket.on('getEpg', function (data) {
        var start = (data.site - 1) * config.app.entries;
        
        rest.get(restfulUrl + '/events/' + data.channelid + '.json?timespan=0&start=' + start + '&limit=' + config.app.entries).on('complete',  function (epg) {
            for (var i in epg.events) {
                var start = new Date(epg.events[i].start_time * 1000);
                var stop = new Date((epg.events[i].start_time + epg.events[i].duration) * 1000);
                
                epg.events[i].start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
                epg.events[i].stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();
                
                epg.events[i].day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            }
            
            socket.emit('getEpg', {
                channelEpg: epg.events
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