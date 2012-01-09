var AboutView = Backbone.View.extend({
    template: 'AboutTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});