var fs = require('fs'),
    xml2json = require('xml2json')
    epg = require('epg'),
    rest = require('restler'),
    sys = require('sys'),
    EventEmitter = require('events').EventEmitter;

function Setup (resturl) {
    var self = this;
    
    rest.get(resturl + '/channels.json?start=0').on('complete', function(data) {
        var x = 0;
        
        for (var i in data.channels) {
            epg.channel.add(data.channels[i], function () {
                x++;
                
                if (x == data.channels.length) {
                    self.emit('channel/setup/complete');
                }
            });
        }
    });
    
    this.on('channel/setup/complete', function () {
        var ratingRegex = /^\[([\*]*?)\](.*)/;
        
        epg.channel.getAll(function (res) {
            var i = 0;
            
            self.on('process/next/channel', function () {
                console.log('Proccess channel_id: ' + res[i].channel_id);
                
                rest.get(resturl + '/events/' + res[i].channel_id + '.json?start=0').on('complete', function(events) {
                    var eventsProcessed = 0;
                    
                    if (typeof(events.events) == 'undefined') {
                        i++;
                        self.emit('process/next/channel');
                        return;
                    }
                    
                    self.on('process/next/event', function () {
                        var data = events.events[eventsProcessed];
                        var event = {};
                        var rating = null;

                        if (ratingRegex.test(data.description)) {
                            var match = data.description.match(ratingRegex);
                            rating = match[1].length;
                            data.description = match[2];
                        }

                        event.id = data.id;
                        event.title = data.title;
                        event.short_description = data.short_text;
                        event.description = data.description;
                        event.start_time = data.start_time;
                        event.duration = data.duration;
                        event.images = data.images;
                        event.rating = rating;
                        event.year = (typeof(data.components) == 'undefined') ? null : data.components.year;

                        epg.channel.addEvents(res[i].id, event, function () {
                            console.log('Event ' + event.id + ' proccessed');
                            eventsProcessed++;
                            
                            if (eventsProcessed == events.events.length) {
                                i++;
                                self.emit('process/next/channel');
                            } else {
                                self.emit('process/next/event');
                            }
                        });
                    });
                    
                    self.emit('process/next/event');
                }).on('error', function () {
                    i++;
                    self.emit('process/next/channel');
                });

                if (i == res.length) {
                    self.emit('epg/setup/complete');
                }
            });
            
            self.emit('process/next/channel');
        });
    });
    
    this.on('epg/setup/complete', function () {
        console.log('completed');
    });
}

sys.inherits(Setup, EventEmitter);

var setup = new Setup('http://127.0.0.1:8002');

//var json = xml2json.toJson(fs.readFileSync('/var/cache/epgdata2vdr/include/category.xml'));
//console.log(json);

//console.log(epg.actor.add);
epg.actor.get('Brad Pitt', function (err, row) {
    console.log(row);
});

module.exports = {
    setup: setup
};