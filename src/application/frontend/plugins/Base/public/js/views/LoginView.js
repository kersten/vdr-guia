var LoginView = Backbone.View.extend({
    template: 'BaseLoginTemplate',

    events: {
        'submit form': 'loginAction',
        'click #lostPassword': 'lostPasswordAction'
    },

    loginAction: function (event) {
        "use strict";

        $('.error', this.el).removeClass('error');
        $('.help-inline', this.el).remove();

        event.preventDefault();

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
        "use strict";

        event.preventDefault();
        Backbone.history.navigate('!/Password/Lost', true);
    },

    render: function () {
        "use strict";

        $(this.el).html(_.template($('#' + this.template).html(), {}));

        setTimeout(function () {
            $('#username', this.el).focus();
        }, 100);

        $('form', this.el).i18n();

        return this;
    }
});