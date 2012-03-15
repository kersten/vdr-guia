var LoginView = Backbone.View.extend({
    template: 'BaseLoginTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});