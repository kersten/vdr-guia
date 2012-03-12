var Channel = require('../lib/Channel');

io.sockets.on('connection', function (socket) {
    socket.on('NavigationCollection:read', function (data, callback) {

        callback({
            items: GUIA.navigation.getMenu(socket.handshake.session.loggedIn),
            loggedIn: socket.handshake.session.loggedIn
        });

        return;

        if (socket.handshake.session.loggedIn) {
            var channels = new Channel();
            channels.getAll({active: true}, function (docs) {
                var channels_array = [];

                if (docs) {
                    docs.forEach(function (channel) {
                        channels_array.push({
                            title: channel.get('name'),
                            type: 'channel',
                            view: 'Program/' + channel.get('_id')
                        });
                    });
                }

                var program = {
                    title: __('Program'),
                    icon: 'book'
                };

                if (channels_array.length == 0) {
                    program.view = 'Program';
                } else {
                    program.items = channels_array;
                }

                var menu = [{
                    title: __('Highlights'),
                    icon: 'heart',
                    view: 'Highlights'
                }, {
                    title: __('TV Guide'),
                    icon: 'list',
                    view: 'TVGuide'
                }, program, {
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
                }, {
                    title: __('yaVDR'),
                    icon: 'edit',
                    view: 'yaVDR'
                }];

                callback({items: menu, loggedIn: true});
            });
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