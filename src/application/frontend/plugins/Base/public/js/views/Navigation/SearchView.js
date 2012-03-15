var NavigationSearchView = Backbone.View.extend({
    template: 'BaseNavigationSearchTemplate',

    tagName: 'form',
    className: 'navbar-search pull-left',

    events: {
        'keyup input': 'query',
        'keypress input': 'stop'
    },

    initialize: function () {
        $(this.el).css('display', 'none');

        //$(this.el).html(_.template( $('#' + this.template).html(), {} ));

        $(this.el).i18n();
    },

    stop: function (ev) {
        if ((ev.keyCode|ev.charCode) == 13) {
            ev.preventDefault();
        }
    },

    query: function (ev) {
        if (!location.href.match(/\/Search/)) {
            Backbone.history.navigate('!/Search/', true);
        }

        var char = String.fromCharCode(ev.keyCode|ev.charCode);

        $('#searchevents').children().remove();
        $('#searchactors').children().remove();

        if ((!char.match(/^ /ig) || (ev.keyCode|ev.charCode) == 32) && $(ev.currentTarget).val().length > 2) {
            Backbone.history.navigate('!/Search/' + $(ev.currentTarget).val());

            this.options.query = $(ev.currentTarget).val();

            if (this.timeoutId !== undefined) {
                clearTimeout(this.timeoutId);
            }

            var _this = this;

            this.timeoutId = setTimeout(function () {
                var searchresult = new SearchresultModel();
                searchresult.fetch({
                    data: {
                        query: _this.options.query
                    }, success: function () {
                        var eventsView = new SearchEventsView({
                            el: $('#searchevents'),
                            model: searchresult.get('events')
                        });

                        eventsView.render();

                        var actorsView = new SearchActorsView({
                            el: $('#searchactors'),
                            model: searchresult.get('actors')
                        });

                        actorsView.render();
                    }
                });
            }, 300);
        }
    },

    render: function () {
        return this;
    }
});