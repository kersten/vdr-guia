var EventView = Backbone.View.extend({
    url: "event",

    initialize: function () {

    },

    generateHTML: function (callback) {
        var self = this;
        this.event = new EventModel();

        this.event.fetch({
            data: {
                _id: '4eefa0012f32ed7d18005ab0'
            },
            success: function (event) {
                console.log(self.event);
                callback.apply(this, [_.template(self.template, {event: self.event})]);
            }
        });
    }
});
