module.exports = {
    index: function (req, res) {
        var start = req.param("site", 0) * config.app.entries;

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

            console.log(data);

            res.render('searchtimer', {
                layout: false,
                global: {
                    title: 'Searchtimer',
                    loggedIn: req.session.loggedIn,
                    maxEntries: config.app.entries
                },
                searchtimers: data.searchtimers,
                paginator: {
                        total: data.total,
                        cur: parseInt(req.param("site", 1)),
                        sites: Math.floor(data.total / config.app.entries),
                        next: parseInt(req.param("site", 1)) + 1,
                        previous: parseInt(req.param("site", 1)) -1
                    }
            });
        });
    }
};