var Navigation = require('../../../../lib/Navigation');

var NavigationCollection = {
    listener: {
        read: function (data, cb) {
            cb({
                items: Navigation.getMenu(this.handshake.session.loggedIn),
                loggedIn: this.handshake.session.loggedIn
            });
        }
    }
};

module.exports = NavigationCollection;