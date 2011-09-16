module.exports = {
    "app.js": function (req, res) {
        res.render('js/app.js', {
            layout: false,
            restfulUrl: restfulUrl
        });
    },
    "vdr/manager.js": function (req, res) {
        res.render('js/vdr/manager.js', {
            layout: false
        });
    },
    "vdr/manager/program.js": function (req, res) {
        res.render('js/vdr/manager/program.js', {
            layout: false
        });
    },"vdr/manager/recording.js": function (req, res) {
        res.render('js/vdr/manager/recording.js', {
            layout: false
        });
    },"vdr/manager/search.js": function (req, res) {
        res.render('js/vdr/manager/search.js', {
            layout: false
        });
    },"vdr/manager/settings.js": function (req, res) {
        res.render('js/vdr/manager/settings.js', {
            layout: false
        });
    },"vdr/manager/timer.js": function (req, res) {
        res.render('js/vdr/manager/timer.js', {
            layout: false
        });
    },
    "jquery-1.6.2.min.js": function (req, res) {
        res.render('js/jquery-1.6.2.min.js', {
            layout: false
        });
    },
    "plugins/jquery.overlay.js": function (req, res) {
        res.render('js/plugins/jquery.overlay.js', {
            layout: false
        });
    },
    "plugins/jquery.dialog.js": function (req, res) {
        res.render('js/plugins/jquery.dialog.js', {
            layout: false
        });
    },
    "plugins/jquery.alertmessage.js": function (req, res) {
        res.render('js/plugins/jquery.alertmessage.js', {
            layout: false
        });
    },
    "plugins/jquery.fixedcenter.js": function (req, res) {
        res.render('js/plugins/jquery.fixedcenter.js', {
            layout: false
        });
    },
    "plugins/jquery.endless-scroll.js": function (req, res) {
        res.render('js/plugins/jquery.endless-scroll.js', {
            layout: false
        });
    }
};