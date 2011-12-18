var rest = require('restler');
var EventSchema = mongoose.model('Event');
var ActorSchema = mongoose.model('Actor');
var ChannnelSchema = mongoose.model('Channel');
var async = require('async');
var ActorDetails = require('../Actor');

function EpgImport (restful) {
    this.newEpg = false;

    this.restful = restful;

    var ChannelImport = require('../Channel/Import');
    this.channelImporter = new ChannelImport(restful);
}

EpgImport.prototype.start = function (callback) {
    var self = this;
    console.log("Starting epg import ...");

    this.channelImporter.start(function () {
        var channelQuery = ChannnelSchema.find({active: true});

        channelQuery.each(function (err, channel, next) {
            if (channel === undefined) {
                callback(self.newEpg);
                return;
            }

            if (next === undefined) {
                callback(self.newEpg);
                return;
            }

            self.fetchEpg(channel, next);
        });
    });
};

EpgImport.prototype.fetchEpg = function (channel, next) {
    var self = this;

    var from = 0;
    var query = EventSchema.findOne({});

    query.where('channel_id', channel._id);
    query.sort('_id', -1);

    query.exec(function (err, e) {
        if (e != null) {
            from = e.stop + 60;
        }

        console.log('Get events from channel: ' + channel.name);
        rest.get(self.restful + '/events/' + channel.channel_id + '.json?timespan=0&from=' + from + '&start=0&limit=100').on('success', function (res) {
            if (res.events.length == 0) {
                next.call();
                return;
            }

            self.newEpg = true;

            async.map(res.events, function (event, callback) {
                self.extractDetails(channel, event, function (event) {
                    self.insertEpg(event, callback);
                });
            }, function (err, result) {
                if (err) {
                    self.newEpg = false;
                }

                next.call();
            });
        }).on('error', function () {
            next.call();
        });
    });
};

EpgImport.prototype.extractDetails = function (channel, event, callback) {
    async.series([
        function (callback) {
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
                event.category = event_type[1];
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

            callback(null, null);
        }, function (callback) {
            if (event.details === undefined) {
                callback(null, null);
            }

            event.details.forEach(function (details) {
                if (details.key == "YEAR") {
                    event.year = details.value;
                }

                if (details.key == "COUNTRY") {
                    event.country = details.value;
                }

                if (details.key == "SEQUENCE") {
                    event.episode = details.value;
                }

                if (details.key == "REGISSEUR") {
                    event.regisseur = details.value;
                }
            });

            callback(null, null)
        }, function (callback) {
            if (event.details === undefined) {
                callback(null, null);
            }

            async.map(event.details, function (details, callback) {
                if (details.key == "ACTORS") {
                    event.actors = new Array();

                    var actors = details.value.split(' - ');

                    async.map(actors, function (a, callback) {
                        var actor_details = a.match(/(.*?) \((.*?)\)$/);

                        if (actor_details == null) {
                            actor_details = [null, a, null]
                        }

                        ActorSchema.findOne({name: actor_details[1]}, function (err, doc) {
                            if (doc == null) {
                                var actor = new ActorSchema({
                                    name: actor_details[1]
                                });

                                actor.save(function (err, doc) {
                                    event.actors.push({
                                        actorId: actor._id,
                                        character: actor_details[2]
                                    });

                                    var actorDetails = new ActorDetails(actor._id, actor_details[1]);
                                    actorDetails.fetchInformation();

                                    callback(null, null);
                                });
                            } else {
                                event.actors.push({
                                    actorId: doc._id,
                                    character: actor_details[2]
                                });

                                callback(null, null);
                            }
                        });
                    }, function (err, result) {
                        callback(null, null);
                    });
                } else {
                    callback(null, null);
                }
            }, function (err, results) {
                callback(null, null);
            });
        }, function (callback) {
            delete(event.details);
            event.description = event.description.replace(new RegExp( "\\n.*", "g" ), '');

            callback(null, null);
        }
    ], function (err, results) {
        callback(event);
    });
};

EpgImport.prototype.insertEpg = function (event, callback) {
    var eventSchema = new EventSchema(event);
    eventSchema.save(function (err, doc) {
        callback(err, doc);
    });
};

module.exports = EpgImport;