var SearchEventsView = Backbone.View.extend({
    template: 'SearchEventsTemplate',
    
    events: {
        'hover .row': 'hoverEvent'
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

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {events: this.model} ));
        return this;
    }
});