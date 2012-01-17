var SearchActorsView = Backbone.View.extend({
    template: 'SearchActorsTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {actors: this.model} ));
        return this;
    }
});