var TimerCollection = Backbone.Collection.extend({
    url: 'TimerCollection',
    model: TimerModel,
    
    parse: function (response) {
        response.forEach(function (item, index) {
            var start = new Date(item.start_timestamp);
            var stop = new Date(item.stop_timestamp);

            item.start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
            item.stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

            item.day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
        });
        
        return response;
    }
});