var _ = require('underscore')._,
    Backbone = require('backbone'),
    ChannelModel = require('ChannelModel');

var ChannelCollection = Backbone.Collection.extend({
    model: ChannelModel
});

module.exports = ChannelCollection;