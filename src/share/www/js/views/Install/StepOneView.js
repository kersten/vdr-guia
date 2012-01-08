var InstallStepOneView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation // Step 1');
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function (event) {
        var validationFailed = false;

        if ($('#username').parent().parent().hasClass('error')) {
            $('#username').parent().parent().removeClass('error');
            $('#username').removeClass('error');
            $('#username').parent().children('span').remove();
        }

        if ($('#username').val() == '') {
            $('#username').parent().parent().addClass('error');
            $('#username').addClass('error');
            $('#username').parent().append($('<span></span>').addClass('help-inline').html('Username is empty'));

            validationFailed = true;
        } else {
            this.model.set({username: $('#username').val()});
        }

        if ($('#password').parent().parent().hasClass('error')) {
            $('#password').parent().parent().removeClass('error');
            $('#password').removeClass('error');
            $('#password').parent().children('span').remove();
        }

        if ($('#password').val() == '') {
            $('#password').parent().parent().addClass('error');
            $('#password').addClass('error');
            $('#password').parent().append($('<span></span>').addClass('help-inline').html('Password is empty'));

            validationFailed = true;
        } else if ($('#password').val() != $('#repassword').val()) {
            $('#password').parent().parent().addClass('error');
            $('#password').addClass('error');
            $('#password').parent().append($('<span></span>').addClass('help-inline').html('Passwords do not match'));

            validationFailed = true;
        } else {
            //var password = hex_sha512($('#password').val());

            this.model.set({password: $('#password').val()});
        }

        this.model.set({socialize: $('#transmit').is(':checked')});

        if ($('#transmit').is(':checked')) {
            this.model.set({socializeKey: socializeKey});
        } else {
            this.model.set({socializeKey: 'DNT'});
        }

        if (!validationFailed) {
            var view = new InstallStepTwoView({
                model: this.model
            });

            $('#body').html(view.render().el);
        }
    },

    loadPreviousSite: function (event) {
        var view = new InstallSocializeView({
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#InstallStepOneTemplate').html(), {});
        $(this.el).html(template);

        $('#username', this.el).val(this.model.get('username'));
        $('#password', this.el).val(this.model.get('password'));
        $('#transmit', this.el).attr('checked', this.model.get('socalize'));

        $('#socializeKey', this.el).text(socializeKey);

        return this;
    }
});