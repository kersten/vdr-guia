var _ = require('underscore')._,
    Backbone = require('backbone');

var SearchtimerModel = Backbone.Model.extend({
    url: 'Searchtimer'
});

module.exports = SearchtimerModel;