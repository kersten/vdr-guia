var TVGuideEventView = Backbone.View.extend({
    template: 'TVGuideEventTemplate',
    tagName: 'div',

    events: {
        'click div.event': 'showEventDetails',
        'hover div.event': 'showEventPopover'
    },

    handlePopover: function (ev) {
        if (ev.type == 'mouseenter') {
            clearTimeout(ev.data.view.popoverId);
        } else {
            $(ev.data.view.popoverEl).popover('hide');
        }
    },

    showEventDetails: function (ev) {
        $(this.el).popover('hide');
        $('#body').scrollTop();
        GUIA.router.navigate('!/Event/' + this.model.get('_id'), true);
    },

    showEventPopover: function (ev) {
        return;

        var self = this;
        var el = this.el;
        
        if (ev.type == 'mouseenter') {
            this.popoverView = new TVGuidePopoverView({
                popoverEl: el,
                callback: function () {
                    self.popoverView.remove();
                },
                model: this.model
            });

            $(this.el).append(this.popoverView.render().el);
            
            this.popoverView.show();

            $('.event', el).css({
                textDecoration: 'underline',
                cursor: 'pointer'
            });
        } else {
            $('.event', el).css({
                textDecoration: 'none',
                cursor: 'none'
            });
            
            this.popoverView.hide();
        }
    },

    render: function () {
        var self = this;

        var template = _.template( $('#' + this.template).html(), {event: this.model} );
        $(this.el).html(template);

        return this
    }
});