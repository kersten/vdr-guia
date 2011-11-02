var Application = {
    navigation: null,
    views: {},
    currentView: null,
    models: {},
    collections: {},
    overlayDiv: null,
    shortcuts: {}, 
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
    
    recordEvent: function (channel_id, event_id, options) {
        socket.emit('Event:record', {
            channel_id: channel_id,
            event_id: event_id
        }, function (data) {
            if (typeof(data.error) != 'undefined') {
                options.error(data);
            } else {
                options.success(data);
            }
        });
    },
    
    initialize: function () {
        new this.router();
        Backbone.history.start();

        this.collections.navigationCollection = new NavigationCollection;
        $.getScript('/js/views/NavigationView.js', function () {
            this.navigation = new NavigationView({
                el: $('.topbar'), 
                collection: Application.collections.navigationCollection
                });
        });
        
        $(document).bind('keypress', function (event) {
            console.log('Key pressed: ' + event.which);
            
            if (typeof(Application.shortcuts[event.which]) != 'undefined') {
                Application.shortcuts[event.which].apply(this, [event]);
            }
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
        
        if (this.currentView != null) {
            $(Application.views[this.currentView].el).children().remove();
        }

        if (typeof(Application.views[req]) == 'undefined' || typeof(Application.views[req]) == null) {
            Application.views[req] = null;

            $.getScript('/js/views/' + req + 'View.js', function () {
                var viewClass = req + 'View';

                Application.views[req] = new window[viewClass]({
                    el: $('#body')
                });
                
                self.currentView = req;
                callback.apply(self, [req, original]);
            });
        } else {
            this.currentView = req;
            callback.apply(self, [req, original]);
        }
    },
    
    loadSubView: function (req, callback) {
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
    
    overlay: function (method, callback) {
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
            }, function () {
                if (typeof(callback) == 'function') {
                    callback.call();
                }
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
                position: 'fixed',
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