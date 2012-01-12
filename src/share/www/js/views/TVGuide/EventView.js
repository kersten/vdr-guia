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
        $(this.el).popover('hide');
        $('#body').scrollTop();
        GUIA.router.navigate('!/Event/' + this.model.get('_id'), true);
    },

    showEventPopover: function (ev) {
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