var NavigationView = Backbone.View.extend({
    initialize: function () {
        this.model.fetch();
        socket.on('NavigationModel:read', function (data) {
            console.log(data);
        });
    }
});