var TimerCollection = Backbone.Collection.extend({
    url: 'TimerCollection',
    model: TimerModel,
    
    parse: function (response) {
        /*response.forEach(function (item, index) {
            var start = new Date(
                item.start_timestamp.substr(0,4),
                item.start_timestamp.substr(5,2),
                item.start_timestamp.substr(8,2),
                item.start_timestamp.substr(11,2),
                item.start_timestamp.substr(14,2),
                item.start_timestamp.substr(17,2)
            );
            var stop = new Date(
                item.stop_timestamp.substr(0,4),
                item.stop_timestamp.substr(5,2),
                item.stop_timestamp.substr(8,2),
                item.stop_timestamp.substr(11,2),
                item.stop_timestamp.substr(14,2),
                item.stop_timestamp.substr(17,2)
            );

            item.start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
            item.stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

            item.day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
        }); */
        
        return response;
    }
});