var RecordingsRecordingsView = Backbone.View.extend({
    template: 'RecordingsRecordingsTemplate',
    className: 'span12',

    initialize: function () {
        var self = this;

        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        this.collection = new RecordingCollection();

        this.collection.fetch({success: function (collection) {
            collection.forEach(function (model) {
                var view = new RecordingsRecordItemView({
                    model: model
                });

                $('.thumbnails', self.el).append(view.render().el);
            });
        }});
    },

    render: function () {
        return this;
    }
});