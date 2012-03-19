var SetupStepOneView = Backbone.View.extend({
    template: 'SetupStepOneTemplate',

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite',
        'click #existingaccount': 'existing'
    },
    
    existing: function () {
        if ($('#existingaccount').is(':checked')) {
            $('#repassword').parent().parent().slideUp();
            $('fieldset:eq(1)').slideUp();
            $('#next').html('Authenticate');
        } else {
            $('#repassword').parent().parent().slideDown();
            $('fieldset:eq(1)').slideDown();
            $('#next').html('Next step');
        }
    },

    loadNextSite: function (event) {
        var self = this;
        var validationFailed = false;
        
        if ($('#existingaccount').is(':checked')) {
            socket.emit('Install:CheckUser', {
                existingAccount: true,
                username: $('#username').val(),
                password: hex_sha512($('#password').val())
            }, function (data) {
                if (data.success === true) {
                    var view = new SetupStepTwoView({
                        model: self.model
                    });
                    
                    $('#body').html(view.render().el);
                }
            });
        } else {
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
            }
    
            if ($('#transmit').is(':checked')) {
                if ($('#email').val() == '') {
                    $('#email').parent().parent().addClass('error');
                    $('#email').addClass('error');
                    $('#email').parent().append($('<span></span>').addClass('help-inline').html('Email is empty'));
    
                    validationFailed = true;
                } else {
                    this.model.set({username: $('#username').val()});

                    this.model.set({socialize: true});
                    this.model.set({email: $('#email').val()});
                    
                    var password = hex_sha512($('#password').val());
                    this.model.set({password: password});
                    
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
                            var view = new SetupStepTwoView({
                                model: self.model
                            });
    
                            $('#body').html(view.render().el);
                        }
                    });
                }
            } else {
                if (!validationFailed) {
                    this.model.set({username: $('#username').val()});
                    this.model.set({email: $('#email').val()});

                    this.model.set({socialize: false});

                    var password = hex_sha512($('#password').val());
                    self.model.set({password: password});

                    var view = new SetupStepTwoView({
                        model: this.model
                    });
    
                    $('#body').html(view.render().el);
                }
            }
        }
    },

    loadPreviousSite: function (event) {
        var view = new SetupSocializeView({
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#' + this.template).html(), {});
        $(this.el).html(template);

        $('#username', this.el).val(this.model.get('username'));
        $('#password', this.el).val(this.model.get('password'));
        $('#transmit', this.el).attr('checked', this.model.get('socalize'));

        $('#email', this.el).val(this.model.get('email'));

        return this;
    }
});