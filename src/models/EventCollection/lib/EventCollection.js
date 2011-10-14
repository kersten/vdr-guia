var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    EventModel = require('../../EventModel');

var EventCollection = Backbone.Collection.extend({
    url: "EventCollection",
    model: EventModel,
    parse: function (response) {
        response.forEach(function (item) {
            var start = new Date(item.start_time * 1000);
            var stop = new Date((item.start_time + item.duration) * 1000);

            item.start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
            item.stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

            item.day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            
            var rating = null;

            var ratingRegex = /\[([\*]*?)\](.*)/;

            if (ratingRegex.test(item.description)) {
                var match = item.description.match(ratingRegex);
                rating = match[1].length;
                item.description = match[2];
            }

            item.rating = rating;
            
            var genretip = null;

            var genretipRegex = /\[Genretipp\s(.*?)\](.*)/;

            if (genretipRegex.test(item.description)) {
                var match = item.description.match(genretipRegex);
                genretip = match[1];
                item.description = match[2];
            }

            item.genretip = genretip;
        });
        
        return response;
    }
});

module.exports = EventCollection;