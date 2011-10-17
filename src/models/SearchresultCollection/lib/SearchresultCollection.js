var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    SearchresultModel = require('../../SearchresultModel');

var SearchresultCollection = Backbone.Collection.extend({
    url: "SearchresultCollection",
    model: SearchresultModel
});

module.exports = SearchresultCollection;