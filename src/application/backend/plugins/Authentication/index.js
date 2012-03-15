var mongoose = require('mongoose');
    User = mongoose.model('User');

var Authentication = {
    listener: {
        'loggedIn': function (cb) {
            if (this.handshake.session.loggedIn) {
                callback(true);
            } else {
                callback(false);
            }
        },

        'User:login': function (cb) {
            cb();
            return;
            User.findOne({user: data.username, password: data.password}, function (err, doc) {
                var loggedIn = false;

                if (doc) {
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
        }
    }
};

module.exports = Authentication;