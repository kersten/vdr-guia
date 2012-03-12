var YavdrView = Backbone.View.extend({
    template: 'YavdrTemplate',

    initialize: function () {
        $('ul.nav').remove();
        $('.pull-left').remove();
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});