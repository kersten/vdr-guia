var rest = require('restler');
var ChannelSchema =  mongoose.model('Channel');
var async = require('async');

function ChannelImport (restful) {
    this.restful = restful;
}

ChannelImport.prototype.start = function (callback) {
    var self = this;
    log.dbg("Starting channel import  ...");

    rest.get(vdr.restful + '/channels.json?start=0').on('success', function(data) {
        log.dbg("Fetched from VDR ...");
        
        async.mapSeries(data.channels, function (channel, callback) {
            if (socialize !== undefined && socialize && dnodeVdr) {
                log.dbg('Sync channel: ' + channel.name);
                
                dnodeVdr.getChannel(channel, function (res) {
                    res.number = channel.number;
                    res.image = channel.image;
                    res.group = channel.group;
                    
                    self.save(res, function () {
                        log.dbg('Finished syncing: ' + channel.name);
                        callback(null);
                    });
                });
            } else {
                log.dbg('Save channel: ' + channel.name);
                self.save(channel, function () {
                    callback(null);
                });
            }
        }, function (err, result) {
            callback();
        });
    });
};

ChannelImport.prototype.save = function (obj, callback) {
    log.dbg('Save channel: ' + obj.name);
    
    var channelSchema = new ChannelSchema(obj);
    channelSchema.save(function (err) {
        if (err) {
            ChannelSchema.update({
                channel_id: obj.channel_id
            }, obj, {upsert: true}, function () {
                callback();
            });
        } else {
            callback();
        }
    });
};

module.exports = ChannelImport;