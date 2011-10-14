var EventView = Backbone.View.extend({
    url: "program/events",
    eventDiv: null,
    
    initialize: function () {
        
    },
    
    events: {
        'click .eventitem': 'showEvent'
    },
    
    showEvent: function (event) {
        /*switch(event.type) {
        case 'mouseenter':
            this.hoverDiv = $(event.currentTarget).clone();
            
            this.hoverDiv.css({
                position: 'absolute',
                border: '1px solid #DDDDDD',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 -1px 0 rgba(0, 0, 0, 0.1) inset',
                height: $(event.currentTarget).height() + 10,
                width: $(event.currentTarget).width() + 10,
                left: $(event.currentTarget).offset().left - 20,
                top: $(event.currentTarget).offset().top
            });
            
            console.log($(event.currentTarget).height());
            
            $(event.currentTarget).css('opacity', 0);
            this.hoverDiv.insertBefore(event.currentTarget);
            break;

        case 'mouseleave':
            $(event.currentTarget).css('opacity', 1);
            this.hoverDiv.remove();
            break;
        }*/
        
        this.eventDiv = $(event.currentTarget).clone();
            
        this.eventDiv.css({
            position: 'fixed',
            border: '1px solid #DDDDDD',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25), 0 -1px 0 rgba(0, 0, 0, 0.1) inset',
            left: $(event.currentTarget).offset().left,
            top: $(event.currentTarget).offset().top,
            zIndex: 100001,
            backgroundColor: '#FFFFFF',
            cursor: 'auto',
            backgroundClip: 'padding-box'
        }).removeClass('eventitem');
        
        $(event.currentTarget).css('opacity', 0);
        this.eventDiv.insertBefore(event.currentTarget);
        
        this.eventDiv.append($('<div></div>').addClass('modal-footer').css('bottom', 0));
        
        this.eventDiv.children('.eventheader').animate({padding: '5px 15px'});
        
        var elementWidth, elementHeight, windowWidth, windowHeight, X2, Y2;
            elementWidth = this.eventDiv.outerWidth();
            elementHeight = 500;
            windowWidth = jQuery(window).width();
            windowHeight = jQuery(window).height();
            X2 = (windowWidth/2 - elementWidth/2) + "px";
            Y2 = (windowHeight/2 - elementHeight/2) + "px";
        
        this.eventDiv.animate({
            left: X2,
            top: Y2,
            height: 500,
            borderRadius: '6px',
            boxShadow: '0 3px 7px rgba(0, 0, 0, 0.3)'
        });
        
        Application.overlay('show');
    },
    
    generateHTML: function (callback) {
        var self = this;
        
        var EventCollection = require('./EventCollection');
        Application.collections.eventlist = new EventCollection();

        Application.collections.eventlist.fetch({data: {channel_id: this.channel_id, page: this.page}, success: function (collection) {
            console.log(collection);
            callback.apply(this, [_.template(self.template, {events: collection})]);
        }});
    },
    
    render: function () {
        if (this.template == null) {
            return this;
        }

        this.generateHTML(function (res) {
            $('#epglist').html(res);
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