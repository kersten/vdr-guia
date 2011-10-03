var NavigationView = Backbone.View.extend({
    initialize: function () {
        this.collection.fetch();
        
        var self = this;
        
        socket.on('NavigationCollection:read', function (data) {
            if (!data.loggedIn) {
                var template = _.template( $("#LoginFormTemplate").html(), {} );
                self.el.children('div.fill').children('div.container').append(template);
            }
            
            data.items.forEach(function (item) {
                self.collection.add(item);
            });
        });
    },
    
    events: {
        'click #loginBtn': "login"
    },
    
    login: function (event) {
        var self = this;
        
        if ($('#loginUser').val() == "" || $('#loginPass').val() == "") {
            // Show error dialog
            console.log('empty');
            return false;
        }
        
        var password = hex_sha512($('#loginPass').val());
        
        var loginSignal = function (data) {
            socket.removeListener('User:login', loginSignal);
            
            if (data.loggedIn) {
                $(event.currentTarget).parent().remove();
                
                console.log($('ul.nav').children());
                $('ul.nav').children().remove();
                self.collection.fetch();
            }
        };
        
        socket.on('User:login', loginSignal)
        
        socket.emit('User:login', {username: $('#loginUser').val(), password: password});
        
        return false;
    }
});