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
        user.count({user: data.username, password: data.password}, function (err, count) {
            var loggedIn = false;

            if (count != 0) {
                mongooseSessionStore.set(hs.sessionID, {loggedIn: true});
                loggedIn = true;
                hs.session.loggedIn = true;

                hs.session.touch().save();

                log.dbg('Setting up controllers ..');

                fs.readdir(__dirname + '/', function (err, files) {
                    if (err) throw err;
                    files.forEach(function (file) {
                        file = file.replace('.js', '');

                        if (file != 'InstallController' && file != 'NavigationController' && file != 'AuthenticationController') {
                            require(__dirname + '/' + file);
                        }
                    });

                    callback({loggedIn: loggedIn});
                });
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