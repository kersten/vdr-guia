var WelcomeView = Backbone.View.extend({
    template: 'WelcomeTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});