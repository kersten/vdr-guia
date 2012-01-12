var TVGuidePopoverView = Backbone.View.extend({
    template: 'TVGuidePopoverTemplate',

    events: {
        'hover .popover': 'handlePopover',
        'hover img.record': 'switchRecordImage',
        'click img.record': 'recordEvent'
    },

    initialize: function () {
        var self = this;
        var template = _.template( $('#' + this.template).html(), {event: this.model} );

        $(this.el).popover({
            title: function () {
                return self.model.get('title');
            },
            content: function () {
                return template;
            },
            trigger: 'manual',
            placement: 'right',
            html: true,
            el: this.el,
            popoverEl: this.options.popoverEl
        });
    },

    handlePopover: function (ev) {
        console.log(ev);

        if (ev.type == 'mouseenter') {
            console.log(this.timerId);
            clearTimeout(this.timerId);
        } else {
            console.log('RAVE OUT');
            this.hide();
        }
    },
    
    switchRecordImage: function (ev) {
        var image = '';
        var image_record = '-2';

        if (this.model.get('timer_active')) {
            image = '-2';
            image_record = '';
        }

        switch (ev.type) {
            case 'mouseenter':
                $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image_record + '.png');
                break;

            case 'mouseleave':
                $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
                break;
        };
    },

    recordEvent: function () {
        console.log(this);
    },

    show: function () {
        $(this.el).popover('show');
    },

    hide: function () {
        var self = this;

        this.timerId = setTimeout(function () {
            if ( $.support.transition ) {
              transitionEnd = "TransitionEnd"
              if ( $.browser.webkit ) {
                transitionEnd = "webkitTransitionEnd"
              } else if ( $.browser.mozilla ) {
                transitionEnd = "transitionend"
              } else if ( $.browser.opera ) {
                transitionEnd = "oTransitionEnd"
              }
            }

            $(self.el).bind(transitionEnd, function () {
                self.options.callback.call();
            });

            $(self.el).popover('hide');
        }, 100);
    },

    render: function () {
        return this;
    }
});