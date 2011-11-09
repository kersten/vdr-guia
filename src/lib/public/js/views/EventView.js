var EventView = Backbone.View.extend({
    url: "program/events",
    eventDiv: null,
    originalDiv: null,
    
    initialize: function () {
        
    },
    
    events: {
        'click .eventitem': 'showEvent'
    },
    
    showEvent: function (event) {
        Application.showEvent(event);
    },
    
    generateHTML: function (callback) {
        var self = this;
        
        Application.collections.eventlist = new EventCollection();

        Application.collections.eventlist.fetch({data: {channel_id: this.channel_id, page: this.page}, success: function (collection) {
            callback.apply(this, [_.template(self.template, {events: collection, preloaded: false})]);
            Application.loadingOverlay('hide');
            $('#epglist').endlessScroll({
                //bottomPixels: 600,
                callback: function (p) {
                    Application.loadingOverlay('show');
                    self.page = p + 1;
                    Application.collections.eventlist.fetch({data: {channel_id: self.channel_id, page: self.page}, success: function (collection) {
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
            
            $('#channellist').animate({
                right: 40 - $('#channellist').width()
            }, function () {
                $('#channellist').append($('<div></div>').attr('id', 'channellistSlideBarTrans').css({
                    position: 'absolute',
                    top: $('#channellist').scrollTop(),
                    left: 0,
                    width: 40,
                    height: '100%',
                    background: '-moz-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
                    
                }).css({
                    background: '-webkit-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
                .css({
                    background: '-ms-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
                .css({
                    background: '-o-linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'})
                .css({
                    background: 'linear-gradient(left, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
                })).append($('<div></div>').attr('id', 'channellistSlideBar').css({
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
                        });
                        
                        $('#channellist').css({
                            overflow: 'auto'
                        });
                        
                        $('#channellistSlideBar').remove();
                        $('#channellistSlideBarTrans').remove();
                    }
                }));
            });
            
            $('#epglist').fadeIn('normal', function () {
                //$('#epglist').lionbars();
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
