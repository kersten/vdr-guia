var LoginView = Backbone.View.extend({
    template: 'LoginTemplate',

    events: {
        'click #login': 'login'
    },

    login: function (event) {
        $('.error', this.el).removeClass('error');
        $('.help-inline', this.el).remove();

        event.preventDefault();

        var self = this;

        if ($('#username').val() == "" || $('#password').val() == "") {
            // Show error dialog
            return false;
        }

        var password = hex_sha512($('#password').val());

        socket.emit('User:login', {username: $('#username').val(), password: password}, function (data) {
            if (data.loggedIn) {
                GUIA.navigation.login();
                GUIA.navigate('!/Me', true);
            } else {
                if (data.error == 'AccountNotActivated') {
                    $('#username').parent().append($('<span></span>').addClass('help-inline').html('Your account is not activated'));
                    $('#username').parent().parent().addClass('error');
                }

                if (data.error == 'AccountLocked') {
                    $('#username').parent().append($('<span></span>').addClass('help-inline').html('Your account is locked, please contact the GUIA team'));
                    $('#username').parent().parent().addClass('error');
                }

                if (data.error == 'WrongCredentials') {
                    $('#username').parent().append($('<span></span>').addClass('help-inline').html('Username or password is wrong'));
                    $('#username').parent().parent().addClass('error');
                }
            }
        });
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});