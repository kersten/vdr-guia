module.exports = {
    index: function (req, res) {
        res.render('records', {
            layout: false,
            global: {
                title: 'Records',
                loggedIn: req.session.loggedIn
            }
        });
    }
};