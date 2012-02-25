var user = mongoose.model('User');
var fs = require('fs');

io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('loggedIn', function (callback) {
        if (hs.session.loggedIn) {
            callback(true);
        } else {
            callback(false);
        }
    });

    socket.on('User:login', function (data, callback) {
        log.dbg('User tries to login');

        user.findOne({user: data.username, password: data.password}, function (err, doc) {
            var loggedIn = false;

            if (doc) {
                log.dbg('User logged in successfully');

                mongooseSessionStore.set(hs.sessionID, {loggedIn: true});
                loggedIn = true;
                hs.session.loggedIn = true;
                hs.session.touch().save();

                log.dbg('Setting up controllers ..');
                
                callback({loggedIn: loggedIn});
            } else {
                callback({loggedIn: loggedIn});
            }
        });
    });

    socket.on('User:logout', function (data, callback) {
        mongooseSessionStore.destroy(hs.sessionID, function () {
            callback({loggedIn: false});
        });

        hs.session.loggedIn = false;

        hs.session.touch().save();
    });
});