jQuery.extend($.vdrmanager, {
    search: {
        timer: function (site, cb) {
            var getSearchtimers = function (searchtimers) {
                cb.apply(this, arguments);

                socket.removeListener('getSearchtimers', searchtimers);
            };

            socket.on('getSearchtimers', getSearchtimers);

            socket.emit('getSearchtimers', {
                site: site
            });
        }
    }
});