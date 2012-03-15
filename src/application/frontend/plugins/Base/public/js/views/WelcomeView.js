var WelcomeView = Backbone.View.extend({
    template: 'BaseWelcomeTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});