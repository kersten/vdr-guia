var SearchEventsView = Backbone.View.extend({
    template: 'SearchEventsTemplate',
    
    events: {
        'hover .row': 'hoverEvent',
        'click .row': 'showEvent'
    },
    
    hoverEvent: function (ev) {
        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).css({
                backgroundColor: '#DCEAF4'
            });
        } else {
            $(ev.currentTarget).css({
                backgroundColor: ''
            });
        }
    },
    
    showEvent: function (ev) {
        GUIA.router.navigate('!/Event/' + $(ev.currentTarget).data('id'), true);
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {events: this.model} ));
        return this;
    }
});