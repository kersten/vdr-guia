var HelpView = Backbone.View.extend({
    template: 'HelpTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});