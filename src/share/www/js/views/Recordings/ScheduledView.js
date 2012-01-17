var RecordingsScheduledView = Backbone.View.extend({
    template: 'RecordingsScheduledTemplate',
    className: 'span16 columns',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
    },
    
    render: function () {
        return this;
    }
});