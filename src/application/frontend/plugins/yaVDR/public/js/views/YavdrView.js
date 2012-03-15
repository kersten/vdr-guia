var YavdrView = Backbone.View.extend({
    template: 'yaVDRTemplate',

    initialize: function () {
        console.log('yaVDR view init');
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});