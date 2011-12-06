var Application = {
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
    
    showEvent: function (event) {
        var self = this;
        this.originalDiv = $(event.currentTarget);
        this.eventDiv = $(event.currentTarget).clone();
        
        this.eventDiv.children('.eventbody').css('padding', "");

        this.eventDiv.css({
            position: 'fixed',
            left: $(event.currentTarget).offset().left - 35,
            top: $(event.currentTarget).offset().top - 5,
            zIndex: 100001,
            backgroundColor: '#FFFFFF',
            cursor: 'auto',
            backgroundClip: 'padding-box',
            borderRadius: '6px 6px 6px 6px',
            overflow: 'hidden',
            '-webkit-border-radius': '6px',
            '-moz-border-radius': '6px',
            'border-radius': '6px',
            '-webkit-box-shadow': '0 3px 7px rgba(0, 0, 0, 0.3)',
            '-moz-box-shadow': '0 3px 7px rgba(0, 0, 0, 0.3)',
            'box-shadow': '0 3px 7px rgba(0, 0, 0, 0.3)',
            '-webkit-background-clip': 'padding-box',
            '-moz-background-clip': 'padding-box',
            'background-clip': 'padding-box',
            height: this.originalDiv.outerHeight()
        }).removeClass('eventitem').addClass('span13 modalevent');
        
        $(event.currentTarget).css('opacity', 0);
        $('body').append(this.eventDiv);
        
        var modalHeader = this.eventDiv.children('.eventheader');
        modalHeader.addClass('modal-header').css({
            'background-color': '#F5F5F5',
            '-webkit-border-radius': '6px 6px 0 0',
            '-moz-border-radius': '6px 6px 0 0',
            'border-radius': '6px 6px 0 0'
        });
        
        var recordBtn = $('<a></a>');
        recordBtn.addClass('btn error recordevent').text('Seriestimer');
        
        if (this.eventDiv.attr('timer_exists') == "true") {
            recordBtn.addClass('disabled');
        }
        
        var modalFooter = $('<div></div>').addClass('modal-footer').append($('<a></a>').addClass('btn primary closeevent').text('Close').click(function () {
            self.closeEvent();
        })).append(recordBtn);
        this.eventDiv.append(modalFooter);
        
        var modalHeaderHeight = modalHeader.height();
        modalHeaderHeight += parseInt(modalHeader.css("padding-top"), 10) + parseInt(modalHeader.css("padding-bottom"), 10); //Total Padding Width
        modalHeaderHeight += parseInt(modalHeader.css("margin-top"), 10) + parseInt(modalHeader.css("margin-bottom"), 10); //Total Margin Width
        modalHeaderHeight += parseInt(modalHeader.css("borderTopWidth"), 10) + parseInt(modalHeader.css("borderBottomWidth"), 10);
        
        var modalFooterHeight = modalFooter.height();
        modalFooterHeight += parseInt(modalFooter.css("padding-top"), 10) + parseInt(modalFooter.css("padding-bottom"), 10); //Total Padding Width
        modalFooterHeight += parseInt(modalFooter.css("margin-top"), 10) + parseInt(modalFooter.css("margin-bottom"), 10); //Total Margin Width
        modalFooterHeight += parseInt(modalFooter.css("borderTopWidth"), 10) + parseInt(modalFooter.css("borderBottomWidth"), 10);
        
        var elementWidth, elementHeight, windowWidth, windowHeight, X2, Y2;
            elementWidth = this.eventDiv.outerWidth();
            elementHeight = (this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight >= 500) ? 500 : this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight;
            windowWidth = jQuery(window).width();
            windowHeight = jQuery(window).height();
            X2 = (windowWidth/2 - elementWidth/2) + "px";
            Y2 = (windowHeight/2 - elementHeight/2) + "px";
        
        var maxHeight = (this.originalDiv.children('.eventbody')[0].scrollHeight >= 500 - (30 + modalFooterHeight + modalHeaderHeight)) ? 500 - (30 + modalFooterHeight + modalHeaderHeight) : this.originalDiv.children('.eventbody')[0].scrollHeight;
        
        var modalBody = this.eventDiv.children('.eventbody');
        modalBody.addClass('modal-body').css({
            height: maxHeight,
            maxHeight: maxHeight,
            overflow: 'auto',
            position: 'relative'
        });
        
        this.eventDiv.animate({
            left: X2,
            top: Y2,
            height: (this.originalDiv.children('.eventbody')[0].scrollHeight >= 500  - (modalFooterHeight + modalHeaderHeight)) ? 500 : 30 + this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight
        }, function () {
            //modalBody.lionbarsRelative();
            
            Application.shortcuts[114] = function (event) {
                event.preventDefault();
                
                if (self.eventDiv.attr('timer_exists') == "true") {
                    Application.deleteEventTimer(self.eventDiv.attr('timer_id'), {
                        success: function (data) {
                            self.eventDiv.attr('timer_exists', "false");
                            self.originalDiv.attr('timer_exists', "false");
                            
                            self.eventDiv.attr('timer_id', '');
                            self.originalDiv.attr('timer_id', '');
                            
                            self.eventDiv.find('.timer_exists').fadeOut();
                            self.originalDiv.find('.timer_exists').fadeOut();
                        }
                    });
                } else {
                    Application.recordEvent(self.eventDiv.attr('channel_id'), self.eventDiv.attr('event_id'), {
                        success: function (data) {
                            self.eventDiv.attr('timer_exists', "true");
                            self.originalDiv.attr('timer_exists', "true");
                            self.eventDiv.attr('timer_id', data.id);
                            self.originalDiv.attr('timer_id', data.id);
                            
                            var timerSpan = $('<span></span>').css("display", "none").addClass("label important timer_exists").html('Timer active');
                            var timerSpan2 = timerSpan.clone();
                            
                            self.originalDiv.find('.informationlabels').append(timerSpan);
                            self.eventDiv.find('.informationlabels').append(timerSpan2);
                            timerSpan.fadeIn();
                            timerSpan2.fadeIn();
                        }
                    });
                }
            };
        });
        
        this.eventDiv.children('.eventbody').find('.transoverlay').fadeOut();
        
        modalHeader.children('div').find('.timer_active').css('opacity', 1).blinky();

        Application.overlay('show');
        
        $('.siteoverlay').bind('click', function () {
            self.closeEvent();
        });
    },
    
    closeEvent: function () {
        delete(Application.shortcuts[114]);
        
        var self = this;
        
        this.eventDiv.children('.eventbody').find('.transoverlay').fadeIn();
        
        this.eventDiv.animate({
            left: this.originalDiv.offset().left - 30,
            top: this.originalDiv.offset().top,
            height: this.originalDiv.height(),
            borderRadius: 'none',
            backgroundClip: 'none'
        }, function () {
            $(this).remove();
            self.originalDiv.css('opacity', 1);
        });
        
        Application.overlay('hide');
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
    
    deleteEventTimer: function (timer_id, options) {
        socket.emit('Event:deleteTimer', {
            timer_id: timer_id
        }, function (data) {
            if (typeof(data) != 'undefined' && typeof(data.error) != 'undefined') {
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
        this.navigation = new NavigationView({
            el: $('.topbar'), 
            collection: Application.collections.navigationCollection
        });
        
        function setClock() {
            var now = new Date();
            $('#clock').text((now.getHours() < 10 ? "0" : "") + now.getHours() + (now.getSeconds() %2 == 0 ? ":" : " ") + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes());
            setTimeout(setClock, 1000);
        }
        
        setClock();
        
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
                self.render.apply(this, [req, original, self]);
            });
        },

        render: function (req, nav, router) {
            router.updateNavigation(nav);
            this.currentView.renderTemplate();
        }
    }),
    
    loadView: function (req, callback) {
        var original = req;

        if (req == "") {
            req = "/Welcome";
        }
        
        req = req.substr(1);
        req = req.charAt(0).toLowerCase() + req.substr(1);
        
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
        
        this.currentView = new Application.views[req]({
            el: $('#body')
        });
        
        callback.apply(this, [req, original]);
    },
    
    loadSubView: function (req, callback) {
        var original = req;

        if (req == "") {
            req = "/Welcome";
        }
        
        req = req.substr(1);
        req = req.charAt(0).toLowerCase() + req.substr(1);
        
        if (this.currentSubView != null) {
            this.currentSubView.destructor();
            delete this.currentSubView;
            this.currentSubView = null;
        }
        
        this.currentSubView = new Application.views[req]({
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
                    Application.loadingOverlay('hide');
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