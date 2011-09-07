module.exports = {
    index: function (req, res) {
        res.render('layout', {
            layout: false,
            global: {
                title: 'Homepage',
                loggedIn: req.session.loggedIn,
                page: 'layout'
            }
        });
    },
    frontsite: function (req, res) {
        
    }
};