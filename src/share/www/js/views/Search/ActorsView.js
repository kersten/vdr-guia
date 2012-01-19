var SearchActorsView = Backbone.View.extend({
    template: 'SearchActorsTemplate',
    
    events: {
        'hover .row': 'hoverActor'
    },
    
    hoverActor: function (ev) {
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
        $(this.el).html(_.template( $('#' + this.template).html(), {actors: this.model} ));
        return this;
    }
});