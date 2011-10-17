var Application = {
    navigation: null,
    views: {},
    models: {},
    collections: {},
    overlayDiv: null,
    spinner: {
        opts: {
            lines: 12, // The number of lines to draw
            length: 10, // The length of each line
            width: 5, // The line thickness
            radius: 22, // The radius of the inner circle
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 58, // Afterglow percentage
            shadow: false // Whether to render a shadow
        }
    },
    
    initialize: function () {
        var NavigationCollection = require('./NavigationCollection');
        
        new this.router();
        Backbone.history.start();

        this.collections.navigationCollection = new NavigationCollection;
        $.getScript('/js/views/NavigationView.js', function () {
            this.navigation = new NavigationView({
                el: $('.topbar'), 
                collection: Application.collections.navigationCollection
                });
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
            Application.loadingOverlay('show');
            
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

                Application.views[req] = new window[viewClass]({
                    el: $('#body')
                    });
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
                zIndex: 10000,
                opacity: 0,
                backgroundColor: '#000000'
            }).addClass('siteoverlay');
            
            $('body').append(this.overlayDiv);
        }
        
        switch (method) {
        case 'show':
            this.overlayDiv.animate({
                opacity: 0.8
            });
            break;

        case 'hide':
            var self = this;
            this.overlayDiv.animate({
                opacity: 0
            }, {
                complete: function () {
                    $(this).remove();
                    self.overlayDiv = null;
                }
            });
        break;
        }
    },

    loadingOverlay: function (method) {
        if (method == 'show') {
            this.spinner.overlayDiv = $('<div></div>').css({
                position: 'absolute',
                top: '0px',
                width: $(window).width(),
                height: $(window).height(),
                zIndex: 10000,
                opacity: 1
            }).addClass('loadingoverlay').appendTo('body');

            this.spinner.overlayDiv.spin(this.spinner.opts);
        } else {
            this.spinner.overlayDiv.spin(false);
            this.spinner.overlayDiv.remove();
        }
    }
};