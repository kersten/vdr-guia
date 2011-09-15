module.exports = {
    "app.js": function (req, res) {
        res.render('js/app.js', {
            layout: false,
            restfulUrl: restfulUrl
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