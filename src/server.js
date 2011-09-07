var express = require('express');
var app = express.createServer();
var config = require('./etc/config');

require('./mvc').boot(app);

app.listen(config.web.port);
console.log('Express app started on port ' + config.web.port);

app.post('/program/:channelid', function (req, res) {
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
});


