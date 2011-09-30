var _ = require('underscore')._,
    Backbone = require('backbone');

var ConfigurationModel = Backbone.Model.extend({
    defaults: {
        MySQL: {
            username: 'vdr',
            database: 'GUIA',
            host: '127.0.0.1',
            port: 3306
        }
    }
});

module.exports = ConfigurationModel;