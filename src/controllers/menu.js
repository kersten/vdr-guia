var menu = [{
    title: __('Timeline'),
    link: '#timeline'
}, {
    title: __('TV Guide'),
    link: '#tvguide'
}, {
    title: __('Program'),
    link: '#program'
}, {
    title: __('Timer'),
    link: '#timer'
}, {
    title: __('Search'),
    link: '#search'
}, {
    title: __('Searchtimer'),
    link: '#searchtimer'
}, {
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

io.sockets.on('connection', function (socket) {
    socket.on('menu', function () {
        socket.emit('menu', menu);
    });
});

module.exports = {
    index: function (req, res) {
        res.render('menu', {
            layout: false,
            global: {
                loggedIn: req.session.loggedIn
            }
        });
    }
};