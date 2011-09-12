io.sockets.on('connection', function (socket) {
    socket.on('menu', function () {
        var menu = [{
            title: __('Highlights'),
            link: '#Highlights'
        }, {
            title: __('TV Guide'),
            link: '#tvguide'
        }, {
            title: __('Program'),
            link: '#program'
        }, {
            title: __('Timer'),
            link: '#timer'
        }, (vdr.plugins.epgsearch) ? {
            title: __('Search'),
            link: '#search'
        } : null, (vdr.plugins.epgsearch) ? {
            title: __('Searchtimer'),
            link: '#searchtimer'
        } : null, {
            title: __('Recordings'),
            link: '#recordings'
        }, {
            title: __('Settings'),
            link: '#settings'
        }, {
            title: __('About'),
            link: '#about'
        }, {
            title: __('Logout'),
            link: '#logout'
        }];

        socket.emit('menu', menu);
    });
});