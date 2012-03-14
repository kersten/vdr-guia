var EventDescriptionView = Backbone.View.extend({
    template: 'EventDescriptionTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {event: this.model} ));
        return this;
    }
});