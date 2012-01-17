var SearchEventsView = Backbone.View.extend({
    template: 'SearchEventsTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {events: this.model} ));
        return this;
    }
});