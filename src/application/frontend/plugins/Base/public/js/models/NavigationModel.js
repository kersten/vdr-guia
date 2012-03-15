var NavigationModel = Backbone.Model.extend({
    initialize: function () {
        if (this.get('title')) {
            this.set('title', $.t(this.get('title')));
        }

        if (this.get('items')) {
            this.get('items').forEach(function (item) {
                if (item && item.title) {
                    item.title = $.t(item.title);
                }
            });
        }
    }
});