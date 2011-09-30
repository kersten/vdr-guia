//var ConfigurationModel = require('./ConfigurationModel');

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
                this.model.set({password: $('#password').val()});
                this.model.set({repassword: $('#repassword').val()});
            }
            break;
        
        case 'StepThree':
            console.log('Validate mysql input');
            break;
        
        default:
            break;
        }
        
        if (validationFailed) {
            return this;
        }
        
        var nextSite = $(event.currentTarget).attr('next') + 'Template';
        var template = _.template( $("#" + nextSite).html(), {} );
        
        this.el.html( template );
        
        // Set allready inserted values
        $('#username').val(this.model.get('username'));
        $('#password').val(this.model.get('password'));
        $('#repassword').val(this.model.get('repassword'));
        
        $('#MySQLuser').val(this.model.get('MySQL').username);
        $('#MySQLpassword').val(this.model.get('MySQL').password);
        $('#MySQLdatabase').val(this.model.get('MySQL').database);
        $('#MySQLhost').val(this.model.get('MySQL').host);
        $('#MySQLport').val(this.model.get('MySQL').port);
        
        return this;
    },
    
    render: function () {
        // Compile the template using underscore
        var template = _.template( $("#InstallViewTemplate").html(), {} );
        // Load the compiled HTML into the Backbone "el"
        this.el.html( template );
        return this;
    }
});