var t = require('i18next').t;

var Navigation = {
    menu: [],

    addItem: function (item, needsLogin) {
        if (item.order && this.menu[item.order] === undefined) {
            this.menu[item.order] = item;
        }
    },

    getMenu: function (loggedIn) {
        if (loggedIn) {
            return this.menu;
        }

        return [{
            title: t('navigation.home'),
            view: ''
        }, {
            title: t('navigation.about'),
            view: 'About'
        }, {
            title: t('navigation.login'),
            view: 'Login'
        }];
    }
};

module.exports = Navigation;