module.exports = {
    index: function (req, res) {
        res.render('tvguide', {
            layout: false,
            global: {
                title: 'TV Guide',
                loggedIn: req.session.loggedIn
            }
        });
    }
};