var _ = require('underscore')._,
    Backbone = require('backbone');

var TimerModel = Backbone.Model.extend({
    url: 'Timer'
});

module.exports = TimerModel;