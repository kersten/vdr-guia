var InstallStepOneView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation // Step 1');
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function (event) {
        var self = this;
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
            this.model.set({password: $('#password').val()});
        }

        this.model.set({socialize: $('#transmit').is(':checked')});

        if ($('#transmit').is(':checked')) {
            if ($('#email').val() == '') {
                $('#email').parent().parent().addClass('error');
                $('#email').addClass('error');
                $('#email').parent().append($('<span></span>').addClass('help-inline').html('Email is empty'));

                validationFailed = true;
            } else {
                this.model.set({socialize: true});
                this.model.set({email: $('#email').val()});
                
                var password = hex_sha512(self.model.get('password'));
                self.model.set({password: password});
                
                socket.emit('Install:CheckUser', {
                    model: this.model
                }, function (data) {
                    if (!data.err) {
                        self.model.set({
                            socializeKey: data.uuid,
                            salt: data.salt
                        });
                    } else {
                        if (data.err.err.match(/guia-server.users.\$username_1/)) {
                            $('#username').parent().parent().addClass('error');
                            $('#username').addClass('error');
                            $('#username').parent().append($('<span></span>').addClass('help-inline').html('Username is allready registered'));
                        }
                        
                        if (data.err.err.match(/guia-server.users.\$email_1/)) {
                            $('#email').parent().parent().addClass('error');
                            $('#email').addClass('error');
                            $('#email').parent().append($('<span></span>').addClass('help-inline').html('Email is allready registered'));
                        }
                        
                        validationFailed = true;
                    }
                    
                    if (!validationFailed) {
                        var view = new InstallStepTwoView({
                            model: self.model
                        });

                        $('#body').html(view.render().el);
                    }
                });
            }
        } else {
            this.model.set({socialize: false});
            
            if (!validationFailed) {
                var view = new InstallStepTwoView({
                    model: this.model
                });

                $('#body').html(view.render().el);
            }
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

        $('#email', this.el).val(this.model.get('email'));

        return this;
    }
});