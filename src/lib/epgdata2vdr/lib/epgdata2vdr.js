var _ = require('underscore')._,
    Backbone = require('backbone'),
    sys = require('sys'),
    EventEmitter = require('events').EventEmitter,
    ev = new EventEmitter;

Backbone.sync = function (method, model, options) {
    var getUrl = function (object) {
        if (!(object && object.url)) return null;
        return _.isFunction(object.url) ? object.url() : object.url;
    };

    var cmd = getUrl(model).split('/'),
        namespace = cmd[0];

    var params = _.extend({
        req: namespace + ':' + method
    }, options);

    params.data = model.toJSON() || {};

    //console.log(namespace + ':' + method);
    ev.emit(namespace + ':' + method, params.data, function (data) {
        options.success(data);
    });
};

var fs = require('fs'),
    xml2json = require('xml2json'),
    rest = require('restler'),
    epg = require('epg'),
    syslog = require('node-syslog'),
    ChannelCollection = require('ChannelCollection'),
    EventCollection = require('EventCollection'),
    RawEventModel = require('RawEventModel');

syslog.init("VDRManager/epgdata", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);

function Setup (resturl) {
    syslog(syslog.LOG_INFO, 'Starting epg data import');
    
    var self = this;
    
    var channelCollection = new ChannelCollection();
    
    rest.get(resturl + '/channels.json?start=0').on('success', function(data) {
        data.channels.forEach(function (channel) {
            channelCollection.add(channel);
        });
        
        channelCollection.forEach(function (channel) {
            channel.save();
        });
        
        console.log('Finished');
        //channelCollection.getByCid('c1').TEST();
        //self.emit('channel/insert', {channels: data.channels});
    });
    
    ev.on('Channel:create', function (data) {
        db.get('SELECT * FROM channel WHERE channel_id = ?', data.channel_id, function (err, row) {
            if (typeof(row) == 'undefined') {
                var query = 'INSERT INTO channel VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                var values = [
                    data.name,
                    data.number,
                    data.channel_id,
                    data.image,
                    data.group,
                    data.transponder,
                    data.stream,
                    data.is_atsc,
                    data.is_cable,
                    data.is_terr,
                    data.is_sat,
                    data.is_radio,
                ];
            } else {
                var query = 'UPDATE channel SET name =?, number = ?, image = ?, channel_group = ?, transponder = ?, stream = ?, is_atsc = ?, is_cable = ?, is_terr = ?, is_sat = ?, is_radio = ? WHERE channel_id = ?';
                var values = [
                    data.name,
                    data.number,
                    data.image,
                    data.group,
                    data.transponder,
                    data.stream,
                    data.is_atsc,
                    data.is_cable,
                    data.is_terr,
                    data.is_sat,
                    data.is_radio,
                    data.channel_id
                ];
            }
            
            db.run(query, values, function (err) {
                ev.emit('Process:events', {
                    id: (typeof(row) == 'undefined') ? this.lastID : row.id,
                    channel: data.channel_id
                });
            });
        });
    });
    
    ev.on('Process:events', function (data) {
        console.log('Proccess events: ' + data.channel);
        
        rest.get(resturl + '/events/' + data.channel + '.json?start=0').on('success', function(events) {
            var eventCollection = new EventCollection();
            
            events.events.forEach(function (item) {
                item.channel = data.id;
                
                eventCollection.add(new RawEventModel(item));
            });
            
            eventCollection.forEach(function (item) {
                item.save();
            });
        }).on('error', function () {
            console.log('Some error occured');
        });
    });
    
    ev.on('Event:update', function (event) {
        db.run("INSERT INTO event VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            event.id,
            event.title,
            event.short_description,
            event.description,
            event.start_time,
            event.duration,
            event.images,
            event.rating,
            event.parental_rating,
            event.year
        ], function (err, row) {
            console.log(typeof(err));
            console.log(err);
            
            if (typeof(err) == 'object' && err == 'null') {
                console.log('Event exists');
                
                db.get('SELECT id FROM event WHERE eventId = ?', event.id, function (err, row) {
                    db.run('INSERT INTO event2channel VALUES (?, ?)', [row.id, event.channel], function (err, row) {
                        console.log('Duplicated event insert in channel');
                    });
                });
            } else {
                console.log('Last inserted :: ' + this.lastID);

                db.run('INSERT INTO event2channel VALUES (?, ?)', [this.lastID, event.channel], function (err, row) {
                    
                });
            }
        });
    });
    
    this.on('channel/insert', function (data) {
        
        
        syslog(syslog.LOG_INFO, 'Updating channels db');
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
        syslog(syslog.LOG_INFO, 'Channels db update complete');
        epg.channel.getAll(function (res) {
            self.emit('process/next/channel', {res: res});
        });
    });
    
    this.on('process/next/channel', function (data) {
        if (data.res.length == 0) {
            self.emit('epg/setup/complete');
            return;
        }
        
        syslog(syslog.LOG_INFO, 'Processing epg data for channel: ' + data.res[0].name);

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
        var event = new RawEventItemModel.init(data.events[0]);
        
        if (typeof(event.get('regisseur')) != 'undefined') {
            //console.log(event.get('regisseur'));
        }
        
        data.events.shift();

        if (data.events.length == 0) {
            data.res.shift();
            self.emit('process/next/channel', {res: data.res});
            return;
        } else {
            self.emit('process/next/event', {events: data.events, res: data.res});
            return;
        }
        
        var rating = null;

        var ratingRegex = /^\[([\*]*?)\](.*)/;

        if (ratingRegex.test(event.description)) {
            var match = event.description.match(ratingRegex);
            rating = match[1].length;
            event.description = match[2];
        }
        
        event.rating = rating;

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
        syslog(syslog.LOG_INFO, 'Processing epg data complete');
    });
}

sys.inherits(Setup, EventEmitter);

//var json = xml2json.toJson(fs.readFileSync('/var/cache/epgdata2vdr/include/category.xml'));
//console.log(json);

//console.log(epg.actor.add);
//epg.actor.get('Brad Pitt', function (err, row) {
//   console.log(row);
//});

module.exports = {
    Setup: Setup
};