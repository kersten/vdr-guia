var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    EventModel = require('../../EventModel');

var EventCollection = Backbone.Collection.extend({
    url: "EventCollection",
    model: EventModel,
    parse: function (response) {
        response.forEach(function (item, index) {
            var start = new Date(item.start_time * 1000);
            var stop = new Date((item.start_time + item.duration) * 1000);

            item.start = ((start.getHours() < 10) ? '0' : '') + start.getHours() + ':' + ((start.getMinutes() < 10) ? '0' : '') + start.getMinutes();
            item.stop = ((stop.getHours() < 10) ? '0' : '') + stop.getHours() + ':' + ((stop.getMinutes() < 10) ? '0' : '') + stop.getMinutes();

            item.day = ((start.getDate() < 10) ? '0' : '') + start.getDate() + '.' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1);
            
            item.description = item.description.replace(/[\r\n]+/g, '<br />');
            
            var rating = null;

            var ratingRegex = /\[([\*]*?)\]/;

            if (ratingRegex.test(item.description)) {
                var match = item.description.match(ratingRegex);
                rating = match[1].length;
                
                item.description = item.description.replace(ratingRegex, '');
            }

            item.rating = rating;
            
            var genretip = null;

            var genretipRegex = /\[Genretipp\s(.*?)\]/;

            if (genretipRegex.test(item.description)) {
                var match = item.description.match(genretipRegex);
                genretip = match[1];
                
                item.description = item.description.replace(genretipRegex, '');
            }

            item.genretip = genretip;
            
            var divisiontip = null;

            var divisiontipRegex = /\[Spartentipp\s(.*?)\]/;

            if (divisiontipRegex.test(item.description)) {
                var match = item.description.match(divisiontipRegex);
                divisiontip = match[1];
                
                item.description = item.description.replace(divisiontipRegex, '');
            }

            item.divisiontip = divisiontip;
            
            var showid = null;

            var showidRegex = /Show-Id:\s(.*?)$/;

            if (showidRegex.test(item.description)) {
                var match = item.description.match(showidRegex);
                showid = match[2];
                
                item.description = item.description.replace(showidRegex, '');
            }

            item.showid = showid;
            
            item.details.forEach(function (detail) {
                switch (detail.key) {
                case 'ACTORS':
                    var actors = detail.value.split(' - ');
                    
                    actors.forEach(function (actor, index) {
                        var extractActorRegex = /(.*?)\s\((.*?)\)/;
                        
                        if (extractActorRegex.test(actor)) {
                            var match = actor.match(extractActorRegex);
                            actors[index] = {
                                name: match[1],
                                character: match[2]
                            };
                        } else {
                            actors[index] = actor;
                        }
                    });
                    
                    detail.value = actors;
                    break;
                
                case 'COUNTRY':
                    var short_countries = detail.value.split('/');
                    
                    short_countries.forEach(function (country, index) {
                        switch (country) {
                        case 'A':
                            country = 'Österreich';
                            break;
                        
                        case 'CH':
                            country = 'Schweiz';
                            break;
                        
                        case 'D':
                            country = 'Deutschland';
                            break;
                        }
                        
                        short_countries[index] = country;
                    });
                    
                    detail.value = short_countries;
                    
                    break;
                }
            });
            
            var timer_is_recording = false;
            
            if (item.timer_exists == true && item.timer_active == true) {
                if (index == 0) {
                    timer_is_recording = true;
                }
            }
            
            item.timer_is_recording = timer_is_recording;
        });
        
        return response;
    }
});

module.exports = EventCollection;