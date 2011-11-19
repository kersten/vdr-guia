var NavigationView = Backbone.View.extend({
    template: null,
    
    initialize: function () {
        var self = this;
        
        this.collection.fetch({success: function (collection, data) {
             if (!data.loggedIn) {
                var template = _.template( $("#LoginFormTemplate").html(), {} );
                self.el.children('div.fill').children('div.container').append(template);
            }
            
            data.items.forEach(function (item) {
                collection.add(item);
            });
        }});
        
        this.collection.bind('add', function (item) {
            var hash = window.location.hash;

            if (window.location.hash == "" || window.location.hash == "#/") {
                hash = '#';
            }

            var href = $('<a></a>').attr('href', item.get('link')).text(item.get('title'));
            var li = $('<li></li>').append(href);

            if (item.get('link') == hash) {
                li.addClass('active');
            }

            if (typeof(item.get('id')) != 'undefined') {
                li.attr('id', item.get('id'));
            }

            $('.nav:first').append(li);
        });
    },
    
    events: {
        'click #loginBtn': "login",
        'click #logoutBtn': "logout"
    },
    
    login: function (event) {
        var self = this;
        
        if ($('#loginUser').val() == "" || $('#loginPass').val() == "") {
            // Show error dialog
            return false;
        }
        
        var password = hex_sha512($('#loginPass').val());
        
        socket.emit('User:login', {username: $('#loginUser').val(), password: password}, function (data) {
            if (data.loggedIn) {
                Application.views = {};
                $(event.currentTarget).parent().remove();
                
                $('ul.nav').children().remove();
                self.collection.fetch({success: function (collection, data) {
                    data.items.forEach(function (item) {
                        collection.add(item);
                    });
                }});
                window.location.hash = '#';
            }
        });
        
        return false;
    },
    
    logout: function () {
        var self = this;
        
        socket.emit('User:logout', {}, function (data) {
            Application.views = {};
            $('ul.nav').children().remove();
            window.location.hash = '#';
            self.collection.fetch();
        });
    }
});