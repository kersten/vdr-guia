module.exports = {
    index: function (req, res) {
        res.render('settings', {
            layout: false,
            global: {
                title: 'Settings',
                loggedIn: req.session.loggedIn
            },
            config: config
        });
    },
    vdrmanager: function (req, res) {
        res.render('settings/vdrmanager', {
            layout: false,
            config: config
        });
    },
    timeline: function (req, res) {
        res.render('settings/timeline', {
            layout: false,
            config: config
        });
    },
    tvguide: function (req, res) {
        res.render('settings/tvguide', {
            layout: false,
            config: config
        });
    }
};