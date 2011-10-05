var Application = {
    navigation: null,
    views: {},
    models: {},
    collections: {},
    
    initialize: function () {
        var NavigationCollection = require('./NavigationCollection');
        
        new this.router();
        Backbone.history.start();

        this.collections.navigationCollection = new NavigationCollection;
        $.getScript('/js/views/NavigationView.js', function () {
            this.navigation = new NavigationView({el: $('.topbar'), collection: Application.collections.navigationCollection});
        });
    },
    
    router: Backbone.Router.extend({
        loadedViews: {},

        routes: {
            "*actions": "defaultRoute"
        },

        updateNavigation: function (req) {
            if (req == "") {
                $('.nav > li.active').removeClass('active');
                $('.nav > li > a[href="#"]').parent().addClass('active');
            } else {
                $('.nav > li.active').removeClass('active');
                $('.nav > li > a[href="#' + req + '"]').parent().addClass('active');
            }
        },

        defaultRoute: function (req) {
            var self = this;
            var original = req;

            if (req == "") {
                req = "Welcome";
            } else {
                req = req.substr(1);
                req = req.charAt(0).toUpperCase() + req.substr(1);
            }

            if (typeof(Application.views[req]) == 'undefined' || typeof(Application.views[req]) == null) {
                Application.views[req] = null;

                $.getScript('/js/views/' + req + 'View.js', function () {
                    var viewClass = req + 'View';

                    Application.views[req] = new window[viewClass]({el: $('#body')});
                    self.render(req, original);
                });
            } else {
                self.render(req, original);
            }
        },

        render: function (req, nav) {
            this.updateNavigation(nav);
            Application.views[req].renderTemplate();
        }
    })
};