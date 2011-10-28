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
        var self = this;
        this.originalDiv = $(event.currentTarget);
        this.eventDiv = $(event.currentTarget).clone();
        
        this.eventDiv.children('.eventbody').css('padding', "");
            
        this.eventDiv.css({
            position: 'fixed',
            left: $(event.currentTarget).offset().left,
            top: $(event.currentTarget).offset().top,
            zIndex: 100001,
            backgroundColor: '#FFFFFF',
            cursor: 'auto',
            backgroundClip: 'padding-box',
            borderRadius: '6px 6px 6px 6px',
            overflow: 'hidden',
            height: this.originalDiv.outerHeight()
        }).removeClass('eventitem').addClass('span13');
        
        $(event.currentTarget).css('opacity', 0);
        $('body').append(this.eventDiv);
        
        var modalHeader = this.eventDiv.children('.eventheader');
        modalHeader.addClass('modal-header').css('background-color', '#F5F5F5');
        
        var modalFooter = $('<div></div>').addClass('modal-footer').append($('<a></a>').addClass('btn primary closeevent').text('Close').click(function () {
            self.closeEvent();
        }));
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
            overflow: 'hidden',
            position: 'relative'
        });
        
        
        
        this.eventDiv.animate({
            left: X2,
            top: Y2,
            height: (this.originalDiv.children('.eventbody')[0].scrollHeight >= 500  - (30 + modalFooterHeight + modalHeaderHeight)) ? 500 - 30 : this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight
        }, function () {
            modalBody.lionbarsRelative();
            
            Application.shortcuts[114] = function (event) {
                console.log('Record: ' + self.eventDiv.attr('channel_id') + '/' + self.eventDiv.attr('event_id'));
                event.preventDefault();
                
                Application.recordEvent(self.eventDiv.attr('channel_id'), self.eventDiv.attr('event_id'), {
                    success: function (data) {
                        console.log(data);
                    }
                });
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
    
    generateHTML: function (callback) {
        var self = this;
        
        var EventCollection = require('./EventCollection');
        Application.collections.eventlist = new EventCollection();

        Application.collections.eventlist.fetch({data: {channel_id: this.channel_id, page: this.page}, success: function (collection) {
            callback.apply(this, [_.template(self.template, {events: collection})]);
            Application.loadingOverlay('hide');
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
                overflow: 'hidden',
                postion: 'absolute',
                top:0
                //width: 700
            });
            
            $('#epglist').html(res);
            
            
            $('#channellist').animate({
                right: 40 - $('#channellist').width()
            }, function () {
                $('#channellist').append($('<div></div>').attr('id', 'channellistSlideBarTrans').css({
                    position: 'absolute',
                    top: 0,
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
                    top: 0,
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
                        $('#header_div > img').fadeOut();
                        
                        $('#channellist').animate({
                            right: 0
                        }, function () {
                            $('#epglist').children().remove();
                        });
                        
                        $('#channellistSlideBar').remove();
                        $('#channellistSlideBarTrans').remove();
                    }
                }));
            });
            
            $('#epglist').fadeIn('normal', function () {
                $('#epglist').lionbars();
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