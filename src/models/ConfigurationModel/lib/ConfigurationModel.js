var _ = require('underscore')._,
    Backbone = require('backbone-browserify');

var ConfigurationModel = Backbone.Model.extend({
    url: 'ConfigurationModel'
});

module.exports = ConfigurationModel;