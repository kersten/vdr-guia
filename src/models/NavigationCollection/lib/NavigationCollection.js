var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    NavigationModel = require('../../NavigationModel');

var NavigationCollection = Backbone.Collection.extend({
    url: 'NavigationCollection',
    model: NavigationModel
});

module.exports = NavigationCollection;