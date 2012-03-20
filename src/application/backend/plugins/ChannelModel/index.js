var mongoose = require('mongoose'),
    Channel = mongoose.model('Channel');

var ChannelModel = {
    listener: {
        update: function (data, cb) {
            var model = data.model;

            if (!this.handshake.session.loggedIn) {
                cb({success: false});
                return false;
            }

            Channel.update({_id: model._id}, {active: model.active}, false, function () {
                cb({success: true});
            });
        }
    }
};

module.exports = ChannelModel;