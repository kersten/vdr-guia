var ConfigurationModel = Backbone.Model.extend({
    url: 'ConfigurationModel',
    
    defaults: {
        vdrhost: '127.0.0.1',
        restfulport: 8002,
        socialize: true
    },

    validation: {
        username: [{
            required: true,
            msg: $.i18n.t('Userame is required')
        }, {
            minLength: 3,
            msg: $.i18n.t('Userame must be at least 3 characters long')
        }],

        password: {
            required: false,
            fn: 'validatePasswordLength'
        },

        passwordRepeat: {
            required: false,
            equalTo: 'password',
            msg: $.i18n.t('Passwords do not match')
        },

        email: [{
            required: true,
            msg: $.i18n.t('Please enter an email address')
        }, {
            pattern: "email",
            msg: $.i18n.t('Please enter a valid email')
        }]
    },

    validatePasswordLength: function(value, attr) {
        if($('#' + attr).val() !== undefined && $('#' + attr).val().length < 8) {
            return $.i18n.t('Password must be at least 8 characters long');
        }
    }
});