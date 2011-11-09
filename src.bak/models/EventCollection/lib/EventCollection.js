var _ = require('underscore')._,
    Backbone = require('backbone'),
    ChannelModel = require('ChannelModel');

var EventCollection = Backbone.Collection.extend();

module.exports = EventCollection;