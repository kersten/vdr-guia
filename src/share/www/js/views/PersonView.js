var PersonView = var EventView = Backbone.View.extend({
    template: 'PersonTemplate',
    
    events: {
        
    },
    
    initialize: function () {
        this.model.fetch({data: {_id: this.options._id}, success: function (data) {
            console.log(data);
        }});
    },
    
    render: function () {
        return this;
    }
});