io.sockets.on('connection', function (socket) {
    socket.on('NavigationCollection:read', function (data, callback) {
        if (socket.handshake.session.loggedIn) {
            var menu = [{
                title: __('Highlights'),
                view: 'Highlights'
            }, {
                title: __('TV Guide'),
                view: 'TVGuide'
            }, {
                title: __('Recordings'),
                view: 'Recordings'
            }, {
                title: __('Me'),
                items: [{
                    title: __('My Profile'),
                    view: 'Me'
                }, {
                    title: __('Help'),
                    view: 'Help'
                }, {
                    title: __('Shortcuts'),
                    view: 'Help/Shortcuts'
                }, {
                    title: __('Settings'),
                    view: 'Settings'
                }, {
                    title: __('Logout'),
                    link: 'logout',
                    id: 'logoutBtn'
                }]
            }];

            callback({items: menu, loggedIn: true});
        } else {
            var menu = [{
                title: __('Home'),
                view: 'Welcome'
            }, {
                title: __('About'),
                view: 'About'
            }];

            callback({items: menu, loggedIn: false});
        }
    });
});