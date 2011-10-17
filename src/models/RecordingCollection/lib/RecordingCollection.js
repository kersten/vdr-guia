var _ = require('underscore')._,
    Backbone = require('backbone-browserify'),
    RecordingModel = require('../../RecordingModel');

var RecordingCollection = Backbone.Collection.extend({
    url: "RecordingCollection",
    model: RecordingModel
});

module.exports = RecordingCollection;