var rest = require('restler');
var EventSchema = mongoose.model('Event');
var ActorSchema = mongoose.model('Actor');
var ChannnelSchema = mongoose.model('Channel');
var async = require('async');

function EpgImport (restful) {
    this.restful = restful;
    
    var ChannelImport = require('../Channel/Import');
    this.channelImporter = new ChannelImport(restful);
}

EpgImport.prototype.start = function () {
    var self = this;
    console.log("Starting epg import ...");
    
    this.channelImporter.start(function () {
        console.log('Channels updated');
        
        ChannnelSchema.find({}, function (err, channels) {
            async.map(channels, function (channel, callback) {
                var from = 0;
                var query = EventSchema.findOne({});
                
                query.where('channel_id', channel._id);
                query.sort('_id', -1);
                
                query.exec(function (err, e) {
                    if (e != null) {
                        from = e.start;
                    }
                    
                    rest.get(self.restful + '/events/' + channel.channel_id + '.json?from=' + from + '&start=0&limit=20').on('success', function (res) {
                        async.map(res.events, function (event, callback) {
                            event.event_id = event.id;
                            event.id = event.channel + '_' + event.id;
                            
                            if (event.description.match(/\nShow-Id: [0-9]{0,}/)) {
                                var show_id = event.description.match(/\nShow-Id: ([0-9]{0,})/);
                                event.show_id = show_id[1];
                            }
                            
                            event.channel_id = channel._id;
                            
                            event.short_description = event.short_text;
                            delete(event.short_text);
                            
                            event.start = event.start_time;
                            event.stop = event.start_time + event.duration;
                            delete(event.start_time);
                            
                            if (event.description.match(/\nKategorie: .*?\n/)) {
                                var event_type = event.description.match(/\nKategorie: (.*?)\n/);
                                event.type = event_type[1];
                            }
                            
                            if (event.description.match(/\[[\*]{1,}\] /)) {
                                var rating = event.description.match(/\[([\*]{1,})\] /);
                                event.rating = rating[1].length;
                                
                                event.description = event.description.replace(/\[[\*]{1,}\] /, '');
                            }
                            
                            if (event.description.match(/\[Genretipp .*?\] /)) {
                                var tip = event.description.match(/\[Genretipp (.*?)\] /);
                                event.tip = {
                                    genre: tip[1],
                                    type: 'genre'
                                }
                                
                                event.description = event.description.replace(/\[Genretipp .*?\] /, '');
                            }
                            
                            if (event.description.match(/\[Spartentipp .*?\] /)) {
                                var tip = event.description.match(/\[Spartentipp (.*?)\] /);
                                event.tip = {
                                    genre: tip[1],
                                    type: 'sparte'
                                }
                                
                                event.description = event.description.replace(/\[Spartentipp .*?\] /, '');
                            }
                            
                            event.genre = event.contents;
                            delete(event.contents);
                            
                            event.details.forEach(function (detail) {
                                switch(detail.key) {
                                    case "YEAR":
                                        event.year = detail.value;
                                        break;
                                        
                                    case "COUNTRY":
                                        event.country = detail.value;
                                        break;
                                    
                                    case "SEQUENCE":
                                        event.episode = detail.value;
                                        
                                    case "REGISSEUR":
                                        event.regisseur = detail.value;
                                        break;
                                        
                                    case "ACTORS":
                                        event.actors = new Array();
                                        
                                        var actors = detail.value.split(' - ');
                                        actors.forEach(function (actor) {
                                            var actor_details = actor.match(/(.*?) \((.*?)\)$/);
                                            
                                            if (actor_details == null) {
                                                actor_details = [null, actor, null]
                                            }
                                            
                                            var actor = new ActorSchema({
                                                name: actor_details[1],
                                                character: actor_details[2]
                                            });

                                            event.actors.push(actor);
                                        });
                                        break;
                                        
                                    default:
                                        event[detail.key] = detail.value;
                                        break;
                                }
                            });
                            delete(event.details);
                            
                            event.description = event.description.replace(new RegExp( "\\n.*", "g" ), '');

                            var eventSchema = new EventSchema(event);
                            eventSchema.save(function () {
                                callback.call(event);
                            });
                        }, function (err, results) {
                            callback.call(channel);
                        });
                    }).on('error', function () {
                        callback.call(channel);
                    });
                });
            }, function (err, results) {
                console.log('Finished EPG import');
            });
        });
    });
};

module.exports = EpgImport;