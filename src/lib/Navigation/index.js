//var Channel = require('../lib/Channel');

function Navigation () {
    this.menu = [];
}

Navigation.prototype.addItem = function (item, needsLogin) {
    if (item.order && this.menu[item.order] === undefined) {
        this.menu[item.order] = item;
    }
};

Navigation.prototype.getMenu = function (loggedIn) {
    if (loggedIn) {
        return this.menu;
    }

    return [{
        title: __('Home'),
        view: 'Welcome'
    }, {
        title: __('About'),
        view: 'About'
    }, {
        title: __('Login'),
        view: 'Login'
    }];
};

module.exports = Navigation;