var _ = require('underscore')._,
    Backbone = require('backbone'),
    SeacrhtimerModel = require('SearchtimerModel');

var SearchtimerCollection = Backbone.Collection.extend({
    model: SearchtimerModel
});

module.exports = SearchtimerCollection;