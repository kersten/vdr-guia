var TVGuideEventView = Backbone.View.extend({
    url: "tvguide/event",
    template: 'TVGuideEventTemplate',
    
    events: {
        'click .eventDetails': 'showEventDetails',
        'hover .eventDetails': 'showEventPopover'
    },
    
    showEventDetails: function (ev) {
        //$('.popover').remove();
        location.hash = '!/Event/' + $(ev.currentTarget).attr('_id');
    },

    showEventPopover: function (ev) {
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