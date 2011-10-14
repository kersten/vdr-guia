var Application = {
    navigation: null,
    views: {},
    models: {},
    collections: {},
    overlayDiv: null,
    
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
            
            Application.loadView(req, function (req, original) {
                self.render(req, original);
            });
        },

        render: function (req, nav) {
            this.updateNavigation(nav);
            Application.views[req].renderTemplate();
        }
    }),
    
    loadView: function (req, callback) {
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
                callback.apply(self, [req, original]);
            });
        } else {
            callback.apply(self, [req, original]);
        }
    },
    
    overlay: function (method) {
        if (this.overlayDiv == null) {
            this.overlayDiv = $('<div></div>').css({
                position: 'fixed',
                top: '0px',
                width: $(window).width(),
                height: $(window).height(),
                zIndex: 100000,
                opacity: 0,
                backgroundColor: '#000000'
            });
            
            $('body').append(this.overlayDiv);
        }
        
        switch (method) {
        case 'show':
            this.overlayDiv.animate({opacity: 0.8});
            break;
        
        case 'hide':
            var self = this;
            this.overlayDiv.animate({opacity: 0}, {complete: function () {
                $(this).remove();
                self.overlayDiv = null;
            }});
            break;
        }
    }
};