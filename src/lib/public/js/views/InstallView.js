var InstallView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation');
        this.render();
    },
    
    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadNextSite'
    },
    
    loadNextSite: function (event) {
        var validationFailed = false;
        
        switch ($(event.currentTarget).attr('next')) {
        case 'StepTwo':
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
                var password = hex_sha512($('#password').val());
                
                this.model.set({password: password});
            }
            
            this.model.set({socalize: $('#transmit').is(':checked')});
            break;
        case 'StepThree':
            var self = this;
            
            this.model.set({vdrhost: $('#VDRHost').val()});
            this.model.set({restfulport: $('#restfulPort').val()});
            
            var checkRestfulSignal = function (data) {
                socket.removeListener('Install:checkrestful', checkRestfulSignal);
                
                if (data.reachable) {
                    console.log(self.model);
                    self.model.save();
        
                    $.ajax({
                        url: "/templates/install/" + $(event.currentTarget).attr('next'),
                        success: function (res) {
                            var template = _.template(res, {});
                            self.el.html(template);

                            if ($(event.currentTarget).attr('next') == "StepOne") {
                                var id = uuid();
                                self.model.set({socalizeKey: id});
                                $('#socializeKey').html(id);
                            }

                            // Set allready inserted values
                            $('#username').val(self.model.get('username'));
                            $('#password').val(self.model.get('password'));
                            $('#repassword').val(self.model.get('repassword'));

                            $('#VDRHost').val(self.model.get('vdrhost'));
                            $('#restfulPort').val(self.model.get('restfulport'));
                        }
                    });
                } else {
                    $.ajax({
                        url: "/templates/install/dialogs/restfulCheck",
                        success: function (res) {
                            var template = _.template(res, {});
                            $('body').append(template);
                            
                            $('#restfulCheck').modal('show');
                        }
                    });
                }
            };
            
            socket.on('Install:checkrestful', checkRestfulSignal);
            
            socket.emit('Install:checkrestful', {
                vdrhost: $('#VDRHost').val(),
                restfulport: $('#restfulPort').val()
            });
            
            break;
        
        default:
            break;
        }
        
        if (validationFailed) {
            return false;
        }
        
        if ($(event.currentTarget).attr('next') == 'StepThree') {
            return false;
        }
        
        var self = this;
        
        $.ajax({
            url: "/templates/install/" + $(event.currentTarget).attr('next'),
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
                
                if ($(event.currentTarget).attr('next') == "StepOne") {
                    var id = uuid();
                    self.model.set({socalizeKey: id});
                    $('#socializeKey').html(id);
                }
                
                // Set allready inserted values
                $('#username').val(self.model.get('username'));
                $('#password').val(self.model.get('password'));
                $('#repassword').val(self.model.get('repassword'));

                $('#VDRHost').val(self.model.get('vdrhost'));
                $('#restfulPort').val(self.model.get('restfulport'));
            }
        });
        
        return false;
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/install/InstallView",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});