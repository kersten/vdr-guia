io.sockets.on('connection', function (socket) {
    socket.on('NavigationCollection:read', function (data, callback) {
        if (socket.handshake.session.loggedIn) {
            var menu = [{
                title: __('Highlights'),
                icon: 'heart',
                view: 'Highlights'
            }, {
                title: __('TV Guide'),
                icon: 'list',
                view: 'TVGuide'
            }, {
                title: __('Recordings'),
                icon: 'facetime-video',
                view: 'Recordings'
            }, {
                title: __('Me'),
                icon: 'user',
                items: [{
                    title: __('My Profile'),
                    icon: 'user',
                    view: 'Me'
                }, {
                    title: __('Help'),
                    icon: 'question-sign',
                    view: 'Help'
                }, {
                    title: __('Shortcuts'),
                    icon: 'cog',
                    view: 'Shortcuts'
                }, {
                    title: __('Settings'),
                    icon: 'edit',
                    view: 'Settings'
                }, {
                    title: __('Logout'),
                    icon: 'off',
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