var EventModel = Backbone.Model.extend({
    url: 'EventModel',
    start_time: function () {
        var d = new XDate(this.get('start') * 1000);
        
        return d.toString('HH:mm');
    }
});