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
        data.channels.forEach(function (channel) {
            if (socialize && dnode) {
                dnode.transmitChannel(channel);
            }

            var channelSchema = new ChannelSchema(channel);
            channelSchema.save(function (err) {
                if (err) {
                    ChannelSchema.findOne({'channel_id': channel.channel_id}, function (err, c) {
                        c.name = channel.name;
                        c.number = channel.number;
                        c.channel_id = channel.channel_id;
                        c.image = channel.image;
                        c.group = channel.group;
                        c.transponder = channel.transponder;
                        c.stream = channel.stream;
                        c.is_atsc = channel.is_atsc;
                        c.is_cable = channel.is_cable;
                        c.is_terr = channel.is_terr;
                        c.is_sat = channel.is_sat;
                        c.is_radio = channel.is_radio;

                        c.save();
                    });
                }
            });
        });

        callback.call();
    });
};

module.exports = ChannelImport;