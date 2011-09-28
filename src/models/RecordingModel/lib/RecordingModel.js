var _ = require('underscore')._,
    Backbone = require('backbone');

var RecordingModel = Backbone.Model.extend({
    url: 'Recording'
});

module.exports = RecordingModel;