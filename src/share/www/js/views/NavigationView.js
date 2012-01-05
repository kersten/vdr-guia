var NavigationView = Backbone.View.extend({
    template: null,

    initialize: function () {
        var self = this;

        this.collection.fetch({success: function (collection, data) {
            if (!data.loggedIn) {
                var template = _.template( $("#LoginFormTemplate").html(), {} );
                self.el.children('div.fill').children('div.container').append(template);
            } else {
                var template = _.template( $("#SearchFormTemplate").html(), {} );
                self.el.children('div.fill').children('div.container').append(template);
            }

            data.items.forEach(function (item) {
                collection.add(item);
            });

            $('.pull-right').fadeIn();
            $('ul.nav').fadeIn();
        }});

        this.collection.bind('add', function (item) {
            var hash = window.location.hash;

            if (window.location.hash == "" || window.location.hash == "!/") {
                hash = '';
            }

            if (item.get('title') !== undefined && item.get('items') == null) {
                var href = $('<a></a>').html(item.get('title'));
                var li = $('<li></li>').append(href);
                li.data('view', item.get('view'));


                if (item.get('link') == hash) {
                    li.addClass('active');
                }

                if (typeof(item.get('id')) != 'undefined') {
                    li.attr('id', item.get('id'));
                }

                $('ul.nav:first').append(li);
            }

            if (item.get('items')) {
                var dropdownHref = $('<a></a>').html(item.get('title')).addClass('menu');
                var dropdownUl = $('<ul></ul>').addClass('menu-dropdown');
                var dropdownLi = $('<li></li>').append(dropdownHref).append(dropdownUl).addClass('menu').attr('data-dropdown', 'dropdown');

                item.get('items').forEach(function (item) {
                    var href = $('<a></a>').html(item.title);
                    var li = $('<li></li>').append(href);
                    li.data('view', item.view)

                    if (typeof(item.id) != 'undefined') {
                        li.attr('id', item.id);
                    }

                    dropdownUl.append(li);
                });

                $('ul.nav:first').append(dropdownLi);
            }
        });
    },

    events: {
        'click li': 'navigate',
        'click #loginBtn': "login",
        'click #logoutBtn': "logout",
        'keypress #search': 'liveSearch'
    },
    
    navigate: function (ev) {
        GUIA.router.navigate('!/' + $(ev.currentTarget).data('view'));
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
                $(event.currentTarget).parent().remove();

                $('ul.nav').fadeOut(function () {
                    $('ul.nav').children().remove();

                    self.collection.fetch({success: function (collection, data) {
                        var template = _.template( $("#SearchFormTemplate").html(), {} );
                        self.el.children('div.fill').children('div.container').append(template);

                        data.items.forEach(function (item) {
                            collection.add(item);
                        });

                        $('.pull-right').fadeIn();
                        $('ul.nav').fadeIn();
                    }});
                });

                window.location.hash = '#';
            }
        });

        return false;
    },

    logout: function () {
        var self = this;

        socket.emit('User:logout', {}, function (data) {
            $('.pull-right').fadeOut()
            $('ul.nav').fadeOut(function () {
                $('ul.nav').children().remove();
                $('.pull-right').children().remove();

                window.location.hash = '#';

                self.collection.fetch({success: function (collection, data) {
                    if (!data.loggedIn) {
                        var template = _.template( $("#LoginFormTemplate").html(), {} );
                        self.el.children('div.fill').children('div.container').append(template);
                    }

                    data.items.forEach(function (item) {
                        collection.add(item);
                    });

                    $('.pull-right').fadeIn();
                    $('ul.nav').fadeIn();
                }});
            });
        });
    },

    liveSearch: function (ev) {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(function () {
            var searchresult = new SearchresultModel();
            searchresult.fetch({
                data: {
                    query: $(ev.currentTarget).val()
                }, success: function () {
                    _.each(searchresult.get('events'), function (event) {
                        var start = new Date();
                        start.setTime(event.start);

                        console.log(event.title + '(' + start.getHours() + ':' + start.getMinutes() + ')');
                    });

                    _.each(searchresult.get('actors'), function (actor) {
                        console.log(actor.name + ' as ' + actor.character);
                    });
                }
            });
        }, 300);
    }
});