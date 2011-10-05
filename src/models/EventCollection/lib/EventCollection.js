var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    EventModel = require('../../EventModel');

var EventCollection = Backbone.Collection.extend({
    url: "EventCollection",
    model: EventModel
});

module.exports = EventCollection;