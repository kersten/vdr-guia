var parseCookie = require('express/node_modules/connect').utils.parseCookie;

io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = parseCookie(data.headers.cookie);
        data.sessionID = data.cookie['connect.sid'];
        // save the session store to the data object
        // (as required by the Session constructor)
        sessionStore = redis;
        sessionStore.get(data.sessionID, function (err, session) {
            console.log("session:");
            console.log(session);
            if (err) {
                
            } else {
                // create a session object, passing data as request and our
                // just acquired session data
                data.session = new Session(data, session);
            }
        });
    } else {
        console.log('No cookie transmitted.');
        return;
    }
});

io.sockets.on('connection', function (socket) {

});

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

        console.log('endlich');

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