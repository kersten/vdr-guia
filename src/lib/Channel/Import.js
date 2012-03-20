var mongoose = require('mongoose'),
    rest = require('restler'),
    ChannelSchema =  mongoose.model('Channel'),
    Configuration = mongoose.model('Configuration'),
    async = require('async');

function ChannelImport () {
}

ChannelImport.prototype.start = function (cb) {
    var _this = this;

    Configuration.findOne({}, function (err, doc) {
        if (doc) {
            _this.restful = 'http://' + doc.get('vdrHost') + ':' + doc.get('restfulPort');
            _this.fetch(cb);
        }
    });

    //log.dbg("Starting channel import ... " + this.restful + '/channels.json?start=0');
};

ChannelImport.prototype.fetch = function (cb) {
    var _this = this;

    rest.get(this.restful + '/channels.json?start=0').on('success', function(data) {
        //log.dbg("Fetched from VDR ...");

        async.mapSeries(data.channels, function (channel, cb) {
            if (global.socialize !== undefined && global.socialize && global.dnodeVdr) {
                //log.dbg('Sync channel: ' + channel.name);

                dnodeVdr.getChannel(channel, function (res) {
                    res.number = channel.number;
                    res.image = channel.image;
                    res.group = channel.group;

                    _this.save(res, function () {
                        //log.dbg('Finished syncing: ' + channel.name);
                        cb(null);
                    });
                });
            } else {
                //log.dbg('Save channel: ' + channel.name);
                _this.save(channel, function () {
                    cb(null);
                });
            }
        }, function (err, result) {
            cb();
        });
    });
};

ChannelImport.prototype.save = function (obj, callback) {
    //log.dbg('Save channel: ' + obj.name);
    
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