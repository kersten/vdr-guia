var _ = require('underscore')._,
    Backbone = require('backbone');

var EventModel = Backbone.Model.extend({
    url: 'Event'
});

module.exports = EventModel;