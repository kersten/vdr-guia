jQuery.extend($.vdrmanager, {
    channel: {
        list: function (cb) {
            var getChannels = function (channels) {
                cb.apply(this, arguments);

                socket.removeListener('getChannels', getChannels);
            };

            socket.on('getChannels', getChannels);

            socket.emit('getChannels');
        }
    }
});