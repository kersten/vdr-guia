var ProgramEventView = Backbone.View.extend({
    url: "program/events",
    eventDiv: null,
    originalDiv: null,
    runningInterval: null,

    initialize: function () {

    },

    destructor: function () {
        $(this.el).undelegate('.eventitem', 'click');
    },

    events: {
        'click .eventitem': 'showEvent'
    },

    showEvent: function (event) {
        Application.showEvent(event);
    },

    runningBar: function (collection) {
        var self = this;

        var running = ((parseInt(collection.models[0].get('duration')) * 1000) - (((new Date().getTime() / 1000) - collection.models[0].get('start_time')) * 1000));
        var left = ((((new Date().getTime() / 1000) - collection.models[0].get('start_time')) / 60) / (parseInt(collection.models[0].get('duration') / 60))) * 100;
        var leftPixel = ($('.runningBar').parent().width() / 100) * left;

        $('.eventitem.running .runningBar').css({width: leftPixel});

        $('.eventitem.running .runningBar').animate({
            width: $('.eventitem.running .runningBar').parent().width()
        }, running, function () {
            $('.eventitem:first').slideUp(function () {
                $(this).remove();
                collection.remove(collection.models[0]);
                $('.eventitem:first').addClass('running');

                self.runningBar(collection);
            });
        });
    },

    generateHTML: function (callback) {
        var self = this;

        this.eventlist = new EventCollection();

        this.eventlist.fetch({data: {channel_id: this.channel_id, page: this.page}, success: function (collection) {
            callback.apply(this, [_.template(self.template, {events: collection, preloaded: false})]);

            self.runningBar(collection);

            Application.loadingOverlay('hide');

            $('#epglist').endlessScroll({
                callback: function (p) {
                    Application.loadingOverlay('show');
                    self.page = p + 1;
                    self.eventlist.fetch({data: {channel_id: self.channel_id, page: self.page}, success: function (collection) {
                        if (collection.length == 0) {
                            $('#epglist').unbind('scroll');
                        }
                        var events = _.template(self.template, {events: collection, preloaded: true});
                        $('#epglist > .endless_scroll_inner_wrap').append(events);
                        Application.loadingOverlay('hide');
                    }});
                }
            });
        }, error: function () {
            $('#epglist').children().remove();
            Application.loadingOverlay('hide');
        }});
    },

    render: function () {
        if (this.template == null) {
            return this;
        }

        var self = this;

        this.generateHTML(function (res) {
            $('#epglist').css({
                maxHeight: $('#channellist').css('max-height'),
                height:  $('#channellist').css('max-height'),
                overflow: 'auto',
                position: 'absolute',
                top:0
            });

            $('#epglist').html(res);

            $('#channellist').css({
                overflow: 'hidden'
            });

            $('#channellist').append($('<div></div>').attr('id', 'channellistSlideBarTrans').css({
                position: 'absolute',
                top: $('#channellist').scrollTop(),
                left: 0,
                width: 40,
                height: '100%',
                display: 'none',
                background: '-moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'

            }).css({
                background: '-webkit-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
            .css({
                background: '-ms-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
            .css({
                background: '-o-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
            .css({
                background: 'linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
            }).fadeIn()).append($('<div></div>').attr('id', 'channellistSlideBar').css({
                position: 'absolute',
                top: $('#channellist').scrollTop(),
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                opacity: 0.0
            }).bind('mouseenter', function () {
                $(this).data('mouseIn', true);
                $('#channellistSlideBarTrans').animate({left: '+=60'}, 'fast');
                $('#channellist').animate({right: '+=50'}, 'fast');

                //$('#channellistSlideBarTrans').fadeOut('fast');
            }).bind('mouseleave', function () {
                $('#channellistSlideBarTrans').animate({left: '-=60'}, 'fast');
                $('#channellist').animate({right: '-=50'}, 'fast');

                //$('#channellistSlideBarTrans').fadeIn('fast');
            }).bind('click', function () {
                if ($(this).data('mouseIn')) {
                    $('#epglist').fadeOut();
                    $('#epglist').unbind();
                    $('#header_div > img').fadeOut();

                    $('#channellist').animate({
                        right: 0
                    }, function () {
                        $('#epglist').children().remove();
                        self.destructor();
                        delete self;
                        Application.currentSubView = null;
                    });

                    $('#channellist').css({
                        overflow: 'auto'
                    });

                    $('#channellistSlideBar').remove();
                    $('#channellistSlideBarTrans').remove();
                }
            }));

            $('#channellist').animate({
                right: 40 - $('#channellist').width()
            });

            $('#epglist').fadeIn('normal', function () {
                $('.timer_active').blinky();
            });
        });
    },

    renderTemplate: function (channel_id, page) {
        this.channel_id = channel_id,
        this.page = page;

        var self = this;

        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    self.template = res;
                    self.render();
                }
            });
        } else {
            this.render();
        }
    }
});
