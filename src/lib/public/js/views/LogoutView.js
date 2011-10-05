var LogoutView = Backbone.View.extend({
    initialize: function () {
        socket.initOnce('User:logout', function (data) {
            console.log(data);
        });
    },
    
    render: function () {
        return this;
    }
});