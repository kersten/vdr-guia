var _ = require('underscore')._,
    Backbone = require('backbone'),
    ChannelModel = require('ChannelModel');

var TimerCollection = Backbone.Collection.extend({
    model: ChannelModel
});

module.exports = TimerCollection;