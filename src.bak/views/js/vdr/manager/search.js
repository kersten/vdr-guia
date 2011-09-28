jQuery.extend($.vdrmanager, {
    search: {
        timer: function (site, cb) {
            var getSearchtimers = function (searchtimers) {
                if (searchtimers.length == 0) {
                    $(document).unbind('scroll resize');
                }

                socket.removeListener('getSearchtimers', getSearchtimers);
                
                cb.apply(this, arguments);
            };

            socket.on('getSearchtimers', getSearchtimers);

            socket.emit('getSearchtimers', {
                site: site
            });
        }
    }
});