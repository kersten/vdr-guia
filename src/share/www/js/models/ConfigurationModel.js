var ConfigurationModel = Backbone.Model.extend({
    url: 'ConfigurationModel',
    
    defaults: {
        vdrhost: '127.0.0.1',
        restfulport: 8002,
        socialize: true
    }
});