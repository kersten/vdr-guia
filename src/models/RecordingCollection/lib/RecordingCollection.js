var _ = require('underscore')._,
    Backbone = require('backbone'),
    RecordingModel = require('RecordingModel');

var RecordingCollection = Backbone.Collection.extend({
    model: RecordingModel
});

module.exports = RecordingCollection;