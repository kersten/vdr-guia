var mongoose = require('mongoose');
    User = mongoose.model('User');

var Authentication = {
    listener: {
        'loggedIn': function (cb) {
            if (!Authentication.installed) {
                cb({installed: false});
            } else if (this.handshake.session.loggedIn) {
                cb(true);
            } else {
                cb(false);
            }
        },

        'User:login': function (data, cb) {
            var _this = this;

            if (cb) {
                User.findOne({user: data.username, password: data.password}, function (err, doc) {
                    var loggedIn = false;

                    if (doc) {
                        //_this.sessionStore.set(hs.sessionID, {loggedIn: true});
                        loggedIn = true;
                        _this.handshake.session.loggedIn = true;
                        _this.handshake.session.touch().save();

                        cb({loggedIn: loggedIn});
                    } else {
                        cb({loggedIn: loggedIn});
                    }
                });
            } else {
                data();
            }
        }
    }
};

module.exports = Authentication;