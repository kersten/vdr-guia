jQuery.extend($.vdrmanager, {
    epg: {
        list: function (channelid, site, cb) {
            var getEpg = function (epg) {
                cb.apply(this, arguments);

                socket.removeListener('getEpg', getEpg);
            };

            socket.on('getEpg', getEpg);

            socket.emit('getEpg', {
                site: site,
                channelid: channelid
            });
        }
    }
});