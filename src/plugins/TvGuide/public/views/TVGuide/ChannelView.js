var TVGuideChannelView = Backbone.View.extend({
    url: "tvguide/channel",
    template: 'TVGuideChannelTemplate',
    tagName: 'div',

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
        var template = _.template( $('#' + this.template).html(), {channel: this.model} );
        return template;
    }
});