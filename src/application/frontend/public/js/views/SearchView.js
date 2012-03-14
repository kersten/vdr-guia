var SearchView = Backbone.View.extend({
    template: 'SearchTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});