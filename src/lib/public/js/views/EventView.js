var EventView = Backbone.View.extend({
    url: "program/events",
    eventDiv: null,
    originalDiv: null,
    
    initialize: function () {
        
    },
    
    events: {
        'click .eventitem': 'showEvent',
        'click .closeevent': 'closeEvent'
    },
    
    showEvent: function (event) {
        this.originalDiv = $(event.currentTarget);
        this.eventDiv = $(event.currentTarget).clone();
        this.eventDiv.children('.eventbody').children('.transoverlay').remove();
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
            height: this.originalDiv.height()
        }).removeClass('eventitem');
        
        $(event.currentTarget).css('opacity', 0);
        this.eventDiv.insertBefore(event.currentTarget);
        
        var modalHeader = this.eventDiv.children('.eventheader');
        modalHeader.addClass('modal-header').css('background-color', '#F5F5F5');
        
        var modalFooter = $('<div></div>').addClass('modal-footer').append($('<a></a>').addClass('btn primary closeevent').text('Close'));
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
        
        this.eventDiv.animate({
            left: X2,
            top: Y2,
            height: (this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight >= 500) ? 500 : this.originalDiv.children('.eventbody')[0].scrollHeight + modalHeaderHeight + modalFooterHeight,
            "max-height": 500
        });
        
        var modalBody = this.eventDiv.children('.eventbody');
        modalBody.addClass('modal-body').css({'max-height': 500 - (30 + modalFooterHeight + modalHeaderHeight), overflow: 'auto'});
        
	modalHeader.children('div').children('.timer_active').css('opacity', 1).blinky();

        Application.overlay('show');
        
        var self = this;
        $('.siteoverlay').bind('click', function () {
            self.closeEvent();
        });
    },
    
    closeEvent: function () {
        var self = this;
        
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
            console.log(collection);
            callback.apply(this, [_.template(self.template, {events: collection})]);
            Application.loadingOverlay('hide');
        }});
    },
    
    render: function () {
        if (this.template == null) {
            return this;
        }

        this.generateHTML(function (res) {
            $('#epglist').html(res);
            $('.timer_active').blinky();
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
