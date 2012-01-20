var EventModel = Backbone.Model.extend({
    url: 'EventModel',

    initialize: function () {
        if (this.get('short_description') == "" && this.get('description') != "" && this.get('description') != null) {
            this.set({short_description: cutwords(this.get('description'), 140)});
        }
    },

    start_time: function () {
        var d = new XDate(this.get('start') * 1000);

        return d.toString('HH:mm');
    }
});