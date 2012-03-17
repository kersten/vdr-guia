var LoginView = Backbone.View.extend({
    template: 'BaseLoginTemplate',

    events: {
        'submit form': 'loginAction',
        'click #lostPassword': 'lostPasswordAction'
    },

    loginAction: function (event) {
        $('.error', this.el).removeClass('error');
        $('.help-inline', this.el).remove();

        event.preventDefault();

        var _this = this;

        if ($('#username', this.el).val() == "" || $('#password', this.el).val() == "") {
            // Show error dialog
            return false;
        }

        var password = hex_sha512($('#password', this.el).val());

        socket.emit('Authentication:User:login', {username: $('#username', this.el).val(), password: password}, function (data) {
            if (data.loggedIn) {
                EventEmitter.global.emit('loggedIn');
                Backbone.history.navigate('!/Highlights', true);
            }
        });
    },

    lostPasswordAction: function (event) {
        event.preventDefault();
        Backbone.history.navigate('!/Password/Lost', true);
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        $('form', this.el).i18n();

        return this;
    }
});