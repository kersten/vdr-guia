var EventCastView = Backbone.View.extend({
    template: 'EventCastTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {cast: this.model} ));
        return this;
    }
});