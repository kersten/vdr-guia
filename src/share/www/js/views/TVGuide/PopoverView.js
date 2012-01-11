var TVGuidePopoverView = Backbone.View.extend({
    template: 'TVGuidePopoverTemplate',

    events: {
        'hover .popover > div': 'handlePopover',
        'click img': 'recordEvent'
    },

    initialize: function () {
        var self = this;
        var template = _.template( $('#' + this.template).html(), {event: this.model} );

        $(this.options.popoverEl).popover({
            title: function () {
                return self.model.get('title');
            },
            content: function () {
                return template;
            },
            trigger: 'manual',
            placement: 'above',
            html: true,
            el: this.el
        });
    },

    handlePopover: function (ev) {
        console.log(ev);
        return;

        if (ev.type == 'mouseenter') {
            console.log('RAVE');
            clearTimeout(this.timerId);
        } else {
            this.hide();
        }
    },

    recordEvent: function () {
        console.log('test');
    },

    show: function () {
        $(this.options.popoverEl).popover('show');
    },

    hide: function (callback) {
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

            $(self.options.popoverEl).bind(transitionEnd, function () {
                callback.call();
            });

            $(self.options.popoverEl).popover('hide');
        }, 100);
    },

    render: function () {
        return this;
    }
});