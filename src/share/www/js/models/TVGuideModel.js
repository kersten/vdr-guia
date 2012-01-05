var TVGuideModel = Backbone.Model.extend({
    initialize: function() {
        this.events = new EventCollection();
        this.events.params = {
            channel_id: this.get('_id')
        };
    }
});