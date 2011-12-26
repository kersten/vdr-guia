io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;

    socket.on('NavigationCollection:read', function (data, callback) {
        if (hs.session.loggedIn) {
            var menu = [{
                title: __('TV Guide'),
                link: '#/tvguide',
                view: 'TVGuide'
            }, {
                title: __('Program'),
                link: '#/program',
                view: 'Program'
            }, {
                title: __('Recordings'),
                link: '#/recordings',
                view: 'Recordings'
            }, {
                title: __('Settings'),
                link: '#/settings',
                view: 'Settings'
            }, {
                title: __('Logout'),
                link: '#/logout',
                view: 'Logout',
                id: 'logoutBtn'
            }];

            callback({items: menu, loggedIn: true});
        } else {
            var menu = [{
                title: __('Home'),
                link: '#'
            }, {
                title: __('Contact'),
                link: '#/contact'
            }];

            callback({items: menu, loggedIn: false});
        }
    });
});