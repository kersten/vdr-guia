var App = Backbone.Model.extend({
    defaults: {
        Channels: new Channels()
    },
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