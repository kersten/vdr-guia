module.exports = {
    "app.js": function (req, res) {
        res.render('js/app.js', {
            layout: false,
            restfulUrl: restfulUrl
        });
    },
    "models/models.js": function (req, res) {
        res.render('../models/models.js', {
            layout: false
        });
    },
    "collections/Channels.js": function (req, res) {
        res.render('js/collections/Channels.js', {
            layout: false
        });
    },
    "models/Channel.js": function (req, res) {
        res.render('js/models/Channel.js', {
            layout: false
        });
    },
    "views/Menu.js": function (req, res) {
        res.render('js/views/Menu.js', {
            layout: false
        });
    },
    "views/Program.js": function (req, res) {
        res.render('js/views/Program.js', {
            layout: false
        });
    },
    "AppController.js": function (req, res) {
        res.render('js/AppController.js', {
            layout: false
        });
    },
    "backbone.js": function (req, res) {
        res.render('js/backbone.js', {
            layout: false
        });
    },
    "underscore.js": function (req, res) {
        res.render('js/underscore.js', {
            layout: false,
            open: '{{',
            close: '}}'
        });
    },
    "vdr/manager.js": function (req, res) {
        res.render('js/vdr/manager.js', {
            layout: false
        });
    },
    "vdr/manager/epg.js": function (req, res) {
        res.render('js/vdr/manager/epg.js', {
            layout: false
        });
    },
    "vdr/manager/channel.js": function (req, res) {
        res.render('js/vdr/manager/channel.js', {
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
    "jquery-1.6.4.js": function (req, res) {
        res.render('js/jquery-1.6.4.js', {
            layout: false
        });
    },
    "plugins/jquery.tmpl.js": function (req, res) {
        res.render('js/plugins/jquery.tmpl.js', {
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
    },
    "plugins/jquery.jgrowl.js": function (req, res) {
        res.render('js/plugins/jquery.jgrowl.js', {
            layout: false
        });
    }
};