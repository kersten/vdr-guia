var _ = require('underscore')._,
    backbone = require('backbone');

var EventModel = Backbone.Model.extend({
    defaults: {
        id: null,
        title: null,
        short_text: null,
        description: null,
        start_time: null,
        duration: null,
        images: null,
        count: null,
        timer_exists: null,
        timer_active: null,
        timer_id: null,
        components: null
    }
});