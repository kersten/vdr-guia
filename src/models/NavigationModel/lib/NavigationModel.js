var _ = require('underscore')._,
    Backbone = require('backbone-browserify');

var NavigationModel = Backbone.Model.extend({
    url: 'NavigationModel'
});

module.exports = NavigationModel;