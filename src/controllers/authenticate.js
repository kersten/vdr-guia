module.exports = {
    index: function (req, res) {
        if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
            req.session.loggedIn = false;
        } else {
            res.redirect('/');
            return;
        }

        res.render('authenticate', {
            layout: false,
            global: {
                title: 'Login',
                loggedIn: req.session.loggedIn
            }
        });
    },
    login: function (req, res) {
        var username = req.param("username");
        var password = req.param("password");
        
        console.log(this);

        if (username == config.app.username && password == config.app.password) {
            req.session.loggedIn = true;
            res.redirect('/');
        } else {
            res.writeHead(403);
            res.end();
        }
    },
    logout: function (req, res) {
        if (typeof(req.session.loggedIn) != 'undefined' && req.session.loggedIn) {
            req.session.loggedIn = false;
            res.render('authenticate', {
                layout: false
            });
        } else {
            res.render('authenticate', {
                layout: false
            });
        }
    }
};