var YavdrView = Backbone.View.extend({
    template: 'yaVDRTemplate',

    initialize: function () {

    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});