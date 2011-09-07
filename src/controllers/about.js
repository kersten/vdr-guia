module.exports = {
    index: function (req, res) {
        res.render('about', {
            layout: false,
            global: {
                title: 'About',
                loggedIn: req.session.loggedIn,
                page: 'about'
            }
        });
    }
};