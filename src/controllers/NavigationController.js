io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('NavigationCollection:read', function () {
        if (hs.session.loggedIn) {
            var menu = [{
                title: __('Highlights'),
                link: '#/Highlights',
                view: 'Highlights'
            }, {
                title: __('Program'),
                link: '#/program',
                view: 'Program'
            }, {
                title: __('Timer'),
                link: '#/timer',
                view: 'Timer'
            }, (vdr.plugins.epgsearch) ? {
                title: __('Search'),
                link: '#/search',
                view: 'Search'
            } : null, (vdr.plugins.epgsearch) ? {
                title: __('Searchtimer'),
                link: '#/searchtimer',
                view: 'Searchtimer'
            } : null, {
                title: __('Recordings'),
                link: '#/recordings',
                view: 'Recordings'
            }, {
                title: __('Settings'),
                link: '#/settings',
                view: 'Settings'
            }, {
                title: __('Contact'),
                link: '#/contact',
                view: 'Contact'
            }, {
                title: __('Logout'),
                link: '#/logout',
                view: 'Logout',
                id: 'logoutBtn'
            }];
        
            socket.emit('NavigationCollection:read', {items: menu, loggedIn: true});
        } else {
            var menu = [{
                title: __('Home'),
                link: '#'
            }, {
                title: __('Contact'),
                link: '#/contact'
            }];
        
            socket.emit('NavigationCollection:read', {items: menu, loggedIn: false});
        }
    });
});