var rest = require('restler');
var ChannelSchema =  mongoose.model('Channel');
var async = require('async');

function ChannelImport (restful) {
    this.restful = restful;
}

ChannelImport.prototype.start = function (callback) {
    var self = this;
    log.dbg("Starting channel import ...");

    rest.get(self.restful + '/channels.json?start=0').on('success', function(data) {
        async.map(data.channels, function (channel, callback) {
            if (socialize && dnode) {
                dnode.getChannel(channel, function (res) {
                    self.save(function () {
                        callback(null);
                    });
                });
            } else {
                self.save(channel, function () {
                    callback(null);
                });
            }
        }, function (err, result) {
            callback();
        });
    });
};

ChannelImport.prototype.save = function (obj) {
    var channelSchema = new ChannelSchema(obj);
    channelSchema.save(function (err) {
        if (err) {
            ChannelSchema.update({
                channel_id: obj.channel_id
            }, obj, {upsert: true}, function({
                callback.call();
            });
        }
    });
};

module.exports = ChannelImport;