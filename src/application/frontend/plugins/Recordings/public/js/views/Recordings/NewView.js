var RecordingsNewView = Backbone.View.extend({
    template: 'RecordingsNewTemplate',
    className: 'span12 columns',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
    },

    render: function () {
        return this;
    }
});