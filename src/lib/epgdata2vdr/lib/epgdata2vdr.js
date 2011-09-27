var fs = require('fs'),
    xml2json = require('xml2json')
    epg = require('epg'),
    rest = require('restler'),
    sys = require('sys'),
    EventEmitter = require('events').EventEmitter;

function Setup (resturl) {
    var self = this;
    
    rest.get(resturl + '/channels.json?start=0').on('success', function(data) {
        self.emit('channel/insert', {channels: data.channels});
    });
    
    this.on('channel/insert', function (data) {
        epg.channel.add(data.channels[0], function () {
            data.channels.shift();
            
            if (data.channels.length == 0) {
                self.emit('channel/setup/complete');
                return;
            }
            
            self.emit('channel/insert', {channels: data.channels});
        });
    });
    
    this.on('channel/setup/complete', function () {
        epg.channel.getAll(function (res) {
            self.emit('process/next/channel', {res: res});
        });
    });
    
    this.on('process/next/channel', function (data) {
        if (data.res.length == 0) {
            self.emit('epg/setup/complete');
            return;
        }
        
        console.log('Proccess channel: ' + data.res[0].name);

        rest.get(resturl + '/events/' + data.res[0].channel_id + '.json?start=0').on('success', function(events) {
            console.log('Process events');
            
            if (typeof(events.events) == 'undefined' || events.events.length == 0) {
                data.res.shift();
                self.emit('process/next/channel', {res: data.res});
                return;
            }
            
            self.emit('process/next/event', {events: events.events, res: data.res});
            return;
        }).on('error', function () {
            data.res.shift();
            self.emit('process/next/channel', {res: data.res});
            return;
        });
    });
    
    this.on('process/next/event', function (data) {
        var event = data.events[0];
        var rating = null;

        var ratingRegex = /^\[([\*]*?)\](.*)/;

        if (ratingRegex.test(event.description)) {
            var match = event.description.match(ratingRegex);
            rating = match[1].length;
            event.description = match[2];
        }

        event.id = event.id;
        event.title = event.title;
        event.short_description = event.short_text;
        event.description = event.description;
        event.start_time = event.start_time;
        event.duration = event.duration;
        event.images = event.images;
        event.rating = rating;
        event.components = event.components;

        epg.channel.addEvents(data.res[0].id, event, function () {
            data.events.shift();

            if (data.events.length == 0) {
                data.res.shift();
                self.emit('process/next/channel', {res: data.res});
                return;
            } else {
                self.emit('process/next/event', {events: data.events, res: data.res});
                return;
            }
        });
    });
    
    this.on('epg/setup/complete', function () {
        console.log('completed');
    });
}

sys.inherits(Setup, EventEmitter);

//var json = xml2json.toJson(fs.readFileSync('/var/cache/epgdata2vdr/include/category.xml'));
//console.log(json);

//console.log(epg.actor.add);
epg.actor.get('Brad Pitt', function (err, row) {
    console.log(row);
});

module.exports = {
    Setup: Setup
};