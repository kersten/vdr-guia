var EventView = Backbone.View.extend({
    url: "event",

    initialize: function () {
        if (this.options.params._id === undefined) {
            
        }
    },

    generateHTML: function (callback) {
        var self = this;
        this.event = new EventModel();

        this.event.fetch({
            data: {
                _id: this.options.params._id
            },
            success: function () {
                var event = self.event;
                
                if (event.get('description') != null) {
                    
                }
                
                callback.apply(this, [_.template(self.template, {event: event})]);
            }
        });
    }
});
