var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    ChannelModel = require('../../ChannelModel');

var ChannelCollection = Backbone.Collection.extend({
    url: 'ChannelCollection',
    model: ChannelModel
});

module.exports = ChannelCollection;