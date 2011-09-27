var _ = require('underscore')._;
    Backbone = require('backbone');

var App = Backbone.Model.extend({
    initialize: function () {
        var getChannels = function (channels) {
            socket.removeListener('getChannels', getChannels);
            
            for (var i in channels) {
                defaults.Channels.add(new Channel(channels[i]));
            }
        };

        socket.on('getChannels', getChannels);

        socket.emit('getChannels');
    }
});

exports.App = App;