var TVGuideEventView = Backbone.View.extend({
    url: "tvguide/event",
    template: 'TVGuideEventTemplate',
    
    events: {
        'click .eventDetails': 'showEventDetails',
        'hover .eventDetails': 'showEventPopover'
    },
    
    handlePopover: function (ev) {
        if (ev.type == 'mouseenter') {
            clearTimeout(ev.data.view.popoverId);
        } else {
            $(ev.data.view.popoverEl).popover('hide');
        }
    },
    
    recordEvent: function (ev) {
        var image = '-2';
        var timer_active = true;

        if ($(ev.currentTarget).find('img').attr('timer_active') == "true") {
            image = '';
            timer_active = false;
        }

        $(ev.currentTarget).find('img').attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
        $(ev.currentTarget).find('img').attr('timer_active', timer_active);

        console.log('Record: ' + $(ev.currentTarget).attr('_id'));
    },

    handleRecordIcon: function (ev) {
        var image = '';
        var image_record = '-2';

        if ($(ev.currentTarget).attr('timer_active') == "true") {
            image = '-2';
            image_record = '';
        }

        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image_record + '.png');
        } else {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
        }
    },
    
    showEventDetails: function (ev) {
        //$('.popover').remove();
        GUIA.router.navigate('!/Event/' + $(ev.currentTarget).attr('_id'), true);
    },

    showEventPopover: function (ev) {
        console.log('DAMN');
        
        if (!$(ev.currentTarget).hasClass('isPrime')) {
            if (ev.type == 'mouseenter') {
                $(ev.currentTarget).popover('show');
                $(ev.currentTarget).css({textDecoration: 'underline'});
            } else {
                var popover = ev.currentTarget;

                this.popoverEl = popover;
                this.popoverId = setTimeout(function () {
                    $(popover).popover('hide');
                }, 100);

                $(ev.currentTarget).css({textDecoration: 'none'});
            }
        }
    },
    
    render: function () {
        var template = _.template( $('#' + this.template).html(), {event: this.model} );
        $(this.el).html(template);
    }
});