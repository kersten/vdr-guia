var GUIA = {
    navigation: null,
    views: {
        contact: ContactView,
        event: EventView,
        tvguide: TVGuideView,
        logout: LogoutView,
        navigation: NavigationView,
        program: ProgramView,
        recordings: RecordingsView,
        search: SearchView,
        searchresults: SearchresultsView,
        settings: SettingsView,
        timer: TimerView,
        welcome: WelcomeView
    },
    subViews: {
        program: {
            event: ProgramEventView
        },
        settings: {
            channels: SettingsChannelsView,
            guia: SettingsGuiaView,
            database: SettingsDatabaseView
        }
    },
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
            "!/TVGuide": "tvguideRoute",
            "!/TVGuide/:date": "tvguideRoute",
            "!/TVGuide/:date/:page": "tvguideRoute",
            "!/Event/:id": "eventRoute",
            "!/Event/:id/posters": "eventPostersRoute",
            "*actions": "defaultRoute"
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
                callback.apply(this, arguments);
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

        tvguideRoute: function (date, page) {
            this.currentView = new TVGuideView({
                date: date,
                page: page
            });

            $('#body').html(this.currentView.render().el);
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

        defaultRoute: function (req) {
            GUIA.loadingOverlay('show');

            var self = this;

            GUIA.loadView({
                view: req,
                callback: function (req, original) {
                    self.render.apply(this, [req, original, self]);
                }
            });
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