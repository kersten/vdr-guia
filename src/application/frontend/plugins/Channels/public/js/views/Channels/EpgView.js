var ChannelsEpgView = Backbone.View.extend({
    template: 'ChannelsEpgTemplate',

    initialize: function () {
        var self = this;

        this.collection = new EventCollection();
        this.collection.url = 'EventCollection:getEpg';

        this.collection.fetch({data: {_id: this.model.get('_id')}, success: function (events) {
            _.each(events.models, function (model) {
                var date = new XDate(model.get('start') * 1000);

                if (self.currentDay === undefined || self.currentDay != date.toString('dd.MM.yyyy')) {
                    if (self.currentDay !== undefined) {
                        $(self.el).append('<div class="span12"><hr /><h4>' + $.t('day.' + date.toString('dddd')) + date.toString(' - dd.MM.yyyy') + '</h4><hr /></div>');
                    } else {
                        $(self.el).append('<div class="span12"><h4>' + $.t('day.' + date.toString('dddd')) + date.toString(' - dd.MM.yyyy') + '</h4><hr /></div>');
                    }
                }

                self.currentDay = date.toString('dd.MM.yyyy');

                var view = new ChannelsEpgEntryView({
                    model: model
                });

                $(self.el).append(view.render().el);
            });
        }});
    },

    render: function () {
        return this;
    }
});