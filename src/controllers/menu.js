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