var NavigationView = Backbone.View.extend({
    events: {
        'click a.brand': 'navigate',
        'click li > a': 'navigate',
        'click #logoutBtn': "logout",
        'keypress #search': 'loadSearch'
    },

    initialize: function () {
        var _this = this;

        this.collection.fetch({success: function (collection, data) {
            if (data.loggedIn) {
                var SearchView = new NavigationSearchView({});
                $(_this.el).children('div.navbar-inner', _this.el).children('div.container').append(SearchView.render().el);
            }

            data.items.forEach(function (item) {
                collection.add(item);
            });

            $('.pull-left').fadeIn();
            $('ul.nav').fadeIn();
        }});

        this.collection.bind('add', function (item) {
            var hash = window.location.hash;

            if (window.location.hash == "" || window.location.hash == "!/") {
                hash = '';
            }

            if (item.get('title') !== undefined && item.get('items') == null) {
                var href = $('<a></a>').html(item.get('title'));
                href.data('view', item.get('view'));
                href.css('cursor', 'pointer');

                var li = $('<li></li>').append(href);

                if (item.get('icon')) {
                    var icon = $('<i></i>').addClass('icon-' + item.get('icon')).addClass('icon-white').css({marginRight: '10px'});
                    href.prepend(icon);
                    delete(icon);
                }


                if (item.get('link') == hash) {
                    li.addClass('active');
                }

                if (typeof(item.get('id')) != 'undefined') {
                    li.attr('id', item.get('id'));
                }

                $('ul.nav:first').append(li);
            }

            if (item.get('items')) {
                if (item.get('icon')) {
                    var icon = $('<i></i>').addClass('icon-' + item.get('icon')).addClass('icon-white').css({marginRight: '10px'});
                }

                var dropdownHref = $('<a></a>').html(item.get('title') + '<b class="caret"></b>').addClass('dropdown-toggle').attr('data-toggle', 'dropdown').css('cursor', 'pointer');

                if (icon !== undefined) {
                    dropdownHref.prepend(icon);
                    delete(icon);
                }

                var dropdownUl = $('<ul></ul>').addClass('dropdown-menu');

                var dropdownLi = $('<li></li>').append(dropdownHref).append(dropdownUl).addClass('dropdown').attr('data-dropdown', 'dropdown');

                item.get('items').forEach(function (item) {
                    var href = $('<a></a>').html(item.title);
                    href.data('view', item.view);
                    href.css('cursor', 'pointer');

                    if (item.icon) {
                        var icon = $('<i></i>').addClass('icon-' + item.icon).css({marginRight: '10px'});
                        href.prepend(icon);
                        delete(icon);
                    }

                    if (item.type && item.type == 'channel') {
                        var icon = $('<img></img>').attr('src', '/logo/<&= item.title').css({height: '10px', marginRight: '10px'});
                        href.prepend(icon);
                        delete(icon);
                    }

                    var li = $('<li></li>').append(href);

                    if (typeof(item.id) != 'undefined') {
                        li.attr('id', item.id);
                    }

                    dropdownUl.append(li);
                });

                $('ul.nav:first').append(dropdownLi);

                $('.dropdown-toggle').dropdown();
            }

            if (_this.router) {
                _this.router();
                delete(_this.router);
            }
        });
    },

    navigate: function (ev) {
        if ($(ev.currentTarget).data('view') !== undefined) {
            Backbone.history.navigate('!/' + $(ev.currentTarget).data('view'), true);
        }
    },

    loadSearch: function () {
        if (location.href.match(/\!\/Search/)) {
            return;
        }

        Backbone.history.navigate('!/Search', true);
    },

    done: function (cb) {
        this.router = cb;
    },

    logout: function () {
        var _this = this;

        socket.emit('User:logout', {}, function (data) {
            $('.pull-right').fadeOut()
            $('ul.nav').fadeOut(function () {
                $('ul.nav').children().remove();
                $('.pull-right').children().remove();

                _this.collection.fetch({success: function (collection, data) {
                    if (!data.loggedIn) {
                        var template = _.template( $("#LoginFormTemplate").html(), {} );
                        $(_this.el).children('div.fill').children('div.container').append(template);
                    }

                    data.items.forEach(function (item) {
                        collection.add(item);
                    });

                    $('.pull-right').fadeIn();
                    $('ul.nav').fadeIn();

                    Backbone.history.navigate('!/Welcome', true);
                }});
            });
        });
    }
});