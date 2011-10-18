var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    LogoModel = require('../../LogoModel');

var LogoCollection = Backbone.Collection.extend({
    model: LogoModel
});

module.exports = LogoCollection;