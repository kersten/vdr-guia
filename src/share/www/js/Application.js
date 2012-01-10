var GUIA = {
    navigation: null,
    currentView: null,
    currentSubView: null,
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
        },
        open: false
    },

    initialize: function () {
        this.router = new this.routerInit();
        Backbone.history.start({pushState: true});

        this.collections.navigationCollection = new NavigationCollection;
        this.navigation = new NavigationView({
            el: $('.topbar'),
            collection: GUIA.collections.navigationCollection
        });

        function setClock() {
            var now = new Date();
            $('#clock').text((now.getHours() < 10 ? "0" : "") + now.getHours() + (now.getSeconds() %2 == 0 ? ":" : " ") + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes());
            setTimeout(setClock, 1000);
        }

        setClock();

        $('.fetchTmdbInfos').live('click', function (ev) {
            console.log($(ev.currentTarget).attr('_id'));

            $('#fetchTmdbInfo').modal({
                backdrop: true,
                keyboard: true,
                show: true
            });

            // TODO: Fetch infos on unknown movie

            $('#fetchTmdbInfoClose').click(function () {
                $('#fetchTmdbInfo').modal('hide');
            });
        });
    },

    routerInit: Backbone.Router.extend({
        loadedViews: {},

        routes: {
            "": "welcomeRoute",
            "!/Welcome": "welcomeRoute",
            "!/Highlights": "highlightsRoute",
            "!/TVGuide": "tvguideRoute",
            "!/TVGuide/:date": "tvguideRoute",
            "!/TVGuide/:date/:page": "tvguideRoute",
            "!/Event/:id": "eventRoute",
            "!/Event/:id/posters": "eventPostersRoute",
            "!/Event/:id/cast": "eventCastRoute",
            "!/Recordings": "recordingsRoute",
            "!/Me": "profileRoute",
            "!/Help": "helpRoute",
            "!/Help/Shortcuts": "helpShortcutsRoute",
            "!/Settings": "settingsRoute",
            "!/Settings/:section": "settingsRoute",
            "!/About": "aboutRoute",
            "*actions": "notfoundRoute"
        },

        initialize: function () {
            this.bind('all', function(ev) {
                if (ev.indexOf('beforeroute:') === 0) {
                    if (this.currentView != null) {
                        this.currentView.remove();
                    }
                }
            });
        },

        route: function(route, name, callback) {
            return Backbone.Router.prototype.route.call(this, route, name, function() {
                this.trigger.apply(this, ['beforeroute:' + name].concat(_.toArray(arguments)));
                var self = this;
                var func_args = arguments;

                socket.emit('loggedIn', function (loggedIn) {
                    if (!loggedIn && (route != '!/Welcome' && route != '!/About')) {
                        GUIA.router.navigate(route, true);
                    } else {
                        callback.apply(self, func_args);
                    }
                });
            });
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

        welcomeRoute: function () {
            this.currentView = new WelcomeView();
            $('#body').html(this.currentView.render().el);
        },

        highlightsRoute: function () {
            this.currentView = new HighlightsView();
            $('#body').html(this.currentView.render().el);
        },

        tvguideRoute: function (date, page) {
            GUIA.loadingOverlay('show');

            this.currentView = new TVGuideView({
                date: date,
                page: page
            });
        },

        eventRoute: function (_id) {
            GUIA.loadingOverlay('show');

            this.currentView = new EventView({
                _id: _id,
                model: new EventModel
            });

            this.currentView.render(function () {
                $('#body').html(this.el);
                GUIA.loadingOverlay('hide');
            });
        },

        eventPostersRoute: function (_id) {
            GUIA.loadingOverlay('show');

            var self = this;

            GUIA.loadView({
                view: '/Event',
                params: {
                    _id: _id,
                    action: 'posters'
                },
                callback: function (req, original) {
                    self.render.apply(this, [req, original, self]);
                }
            });
        },

        eventCastRoute: function (_id) {
            GUIA.loadingOverlay('show');

            var self = this;

            GUIA.loadView({
                view: '/Event',
                params: {
                    _id: _id,
                    action: 'posters'
                },
                callback: function (req, original) {
                    self.render.apply(this, [req, original, self]);
                }
            });
        },

        recordingsRoute: function () {
            this.currentView = new RecordingsView();
            $('#body').html(this.currentView.render().el);
        },

        profileRoute: function () {
            this.currentView = new ProfileView();
            $('#body').html(this.currentView.render().el);
        },

        helpRoute: function () {
            this.currentView = new HelpView();
            $('#body').html(this.currentView.render().el);
        },

        helpShortcutsRoute: function () {
            this.currentView = new HelpShortcutsView();
            $('#body').html(this.currentView.render().el);
        },

        settingsRoute: function (section) {
            GUIA.loadingOverlay('show');

            this.currentView = new SettingsView({
                section: section
            });

            $('#body').html(this.currentView.render().el);
            GUIA.loadingOverlay('hide');
        },

        aboutRoute: function () {
            this.currentView = new AboutView();
            $('#body').html(this.currentView.render().el);
        },

        notfoundRoute: function (req) {
            this.currentView = new NotFoundView();
            $('#body').html(this.currentView.render().el);
        },

        render: function (req, nav, router) {
            router.updateNavigation(nav);
            this.currentView.renderTemplate();
        }
    }),

    loadView: function (options) {
        var original = options.view;

        if (options.view == "") {
            options.view = "/Welcome";
        }

        options.view = options.view.substr(1);
        options.view = options.view.charAt(0).toLowerCase() + options.view.substr(1);

        if (this.currentView != null) {
            this.currentView.destructor();
            delete this.currentView;
            this.currentView = null;
        }

        if (this.currentSubView != null) {
            this.currentSubView.destructor();
            delete this.currentSubView;
            this.currentSubView = null;
        }

        //var viewOptions = {el: $('#body')};
        var viewOptions = {};

        if (options.params !== undefined) {
            viewOptions = jQuery.extend(viewOptions, {params: options.params});
        }

        this.currentView = new GUIA.views[options.view](viewOptions);

        options.callback.apply(this, [options.view, original]);
    },

    loadSubView: function (req, callback) {
        var self = this;
        var original = req;

        if (req == "") {
            req = "/Welcome";
        }

        req = req.split('/');

        var view = null;

        _.each(req, function (sub) {
            sub = sub.charAt(0).toLowerCase() + sub.substr(1);

            if (self.subViews[sub] !== undefined && view == null) {
                view = self.subViews[sub];
                return;
            }

            if (view[sub] !== undefined) {
                view = view[sub];
            }
        });

        if (this.currentSubView != null) {
            this.currentSubView.destructor();
            delete this.currentSubView;
            this.currentSubView = null;
        }

        this.currentSubView = new view({
            el: $('#body')
        });

        callback.apply(this, [req, original]);
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
            if (!this.spinner.open) {
        	this.spinner.open = true;
                this.spinner.overlayDiv = $('<div></div>').css({
                    position: 'fixed',
                    top: '0px',
                    width: $(window).width(),
                    height: $(window).height(),
                    zIndex: 10000,
                    opacity: 1
                }).addClass('loadingoverlay').appendTo('body');

                this.spinner.overlayDiv.spin(this.spinner.opts);


                this.overlayTimeout = setTimeout(function () {
                    alert('An error occured, please try again.');
                    GUIA.loadingOverlay('hide');
                }, 10000);
            }
        } else {
            if (this.spinner.open) {
                clearTimeout(this.overlayTimeout);
                this.spinner.overlayDiv.spin(false);
                this.spinner.overlayDiv.remove();
                this.spinner.open = false;
            }
        }
    }
};