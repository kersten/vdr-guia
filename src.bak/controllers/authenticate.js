var parseCookie = require('express/node_modules/connect').utils.parseCookie;
var Session = require('express/node_modules/connect').middleware.session.Session;

io.configure(function (){
    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = parseCookie(data.headers.cookie);
            data.sessionID = data.cookie['vdrmanager.id'];
            // save the session store to the data object
            // (as required by the Session constructor)

            data.sessionStore = sessionStore;
            return sessionStore.get(data.sessionID, function (err, session) {
                if (err) {
                    return accept(err.message, false);
                } else {
                    // create a session object, passing data as request and our
                    // just acquired session data
                    data.session = new Session(data, session);
                    return accept(null, true);
                }
            });
        } else {
            return accept('No cookie transmitted.', false);
        }
    });
});

io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;

     var intervalID = setInterval(function () {
        // reload the session (just in case something changed,
        // we don't want to override anything, but the age)
        // reloading will also ensure we keep an up2date copy
        // of the session with our connection.
        hs.session.reload( function () {
            console.log(hs.session);
            // "touch" it (resetting maxAge and lastAccess)
            // and save it back again.
            hs.session.touch().save();
        });
    }, 60 * 1000);

    socket.on('checksession', function () {
        console.log('Check loggedIn');

        if (hs.session.loggedIn) {
            socket.emit('loggedIn', {
                loggedIn: true
            });
        } else {
            socket.emit('loggedIn', {
                loggedIn: false
            });
        }
    });

    socket.on('login', function (data) {
        console.log('Login');

        if (data.username == config.app.username && data.password == config.app.password) {
            hs.session.loggedIn = true;
            hs.session.touch().save();
            console.log(hs.session);
            socket.emit('login.done', {successful: true});
        } else {
            socket.emit('login.done', {successful: false});
        }
    });

    socket.on('disconnect', function () {
        console.log('A socket with sessionID ' + hs.sessionID
            + ' disconnected!');
        // clear the socket interval to stop refreshing the session
        clearInterval(intervalID);
    });
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