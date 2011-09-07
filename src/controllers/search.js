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