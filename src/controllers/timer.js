module.exports = {
    index: function (req, res) {
        var start = (req.param("site", 1) - 1) * config.app.entries;

        rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
            var sorted = new Array();

            for (i in data.timers) {
                sorted[data.timers[i].day + '' +data.timers[i].start] = data.timers[i];
            }

            sorted = ksort(sorted);

            data.timers = new Array();

            for (i in sorted) {
                data.timers.push(sorted[i]);
            }

            res.render('timer', {
                layout: false,
                global: {
                    title: 'Timer',
                    loggedIn: req.session.loggedIn,
                    maxEntries: config.app.entries
                },
                timers: data.timers,
                paginator: {
                    total: data.total,
                    cur: parseInt(req.param("site", 1)),
                    sites: Math.floor(data.total / config.app.entries),
                    next: parseInt(req.param("site", 1)) + 1,
                    previous: parseInt(req.param("site", 1)) -1
                },
                restfulUrl: restfulUrl
            });
        });
    }
};