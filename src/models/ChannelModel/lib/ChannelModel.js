var _ = require('underscore')._,
    Backbone = require('backbone');

var ChannelModel = Backbone.Model.extend({
    url: 'Channel',
    
    defaults: {
        modern: true
    }
});

module.exports = ChannelModel;