var Channel = require('../../../../lib/Channel');

var ChannelCollection = {
    listener: {
        read: function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            var channels = new Channel();

            channels.getAll(data, function (channels) {
                cb(channels);
            });
        }
    }
};

module.exports = ChannelCollection;