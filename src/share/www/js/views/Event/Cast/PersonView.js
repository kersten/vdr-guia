var EventCastPersonView = Backbone.View.extend({
    template: 'EventCastPersonTemplate',
    
    events: {
        'click img': 'showDetails',
        'click a': 'showDetails'
    },
    
    showDetails: function () {
        
    },
    
    render: function () {
        console.log(this.model.get('tmdb').actors);
        $(this.el).html(_.template( $('#' + this.template).html(), {event: this.model} ));
        return this;
    }
});