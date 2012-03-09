var RecordingsScheduledView = Backbone.View.extend({
    template: 'RecordingsScheduledTemplate',
    className: 'span12 columns',

    initialize: function () {
        var self = this;

        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        this.collection = new TimerCollection();
        this.collection.fetch({success: function (collection) {
            collection.forEach(function (model) {
                var view = new RecordingsScheduledItemView({
                    model: model
                });

                $('.thumbnails', self.el).append(view.render().el);
            });
        }})
    },

    render: function () {
        return this;
    }
});