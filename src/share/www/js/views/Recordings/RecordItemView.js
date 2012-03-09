var RecordingsRecordItemView = Backbone.View.extend({
    template: 'RecordingsRecordItemTemplate',
    tagName: 'li',
    className: 'span3',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {model: this.model} ));
    },

    render: function () {
        return this;
    }
});