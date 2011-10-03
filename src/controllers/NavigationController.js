io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('NavigationCollection:read', function () {
        if (hs.session.loggedIn) {
            var menu = [{
                title: __('Highlights'),
                link: '#/Highlights'
            }, {
                title: __('Program'),
                link: '#/program'
            }, {
                title: __('Timer'),
                link: '#/timer'
            }, (vdr.plugins.epgsearch) ? {
                title: __('Search'),
                link: '#/search'
            } : null, (vdr.plugins.epgsearch) ? {
                title: __('Searchtimer'),
                link: '#/searchtimer'
            } : null, {
                title: __('Recordings'),
                link: '#/recordings'
            }, {
                title: __('Settings'),
                link: '#/settings'
            }, {
                title: __('Contact'),
                link: '#/contact'
            }, {
                title: __('Logout'),
                link: '#/logout'
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