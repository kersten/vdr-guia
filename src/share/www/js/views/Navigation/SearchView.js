var NavigationSearchView = Backbone.View.extend({
    template: 'NavigationSearchTemplate',
    
    tagName: 'form',
    className: 'pull-right',
    
    events: {
        'keyup input': 'query',
        'keypress input': 'stop'
    },
    
    initialize: function () {
        $(this.el).css('display', 'none');
        
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
    },
    
    stop: function (ev) {
        if ((ev.keyCode|ev.charCode) == 13) {
            ev.preventDefault();
        }
    },
    
    query: function (ev) {
        var char = String.fromCharCode(ev.keyCode|ev.charCode);
        console.log(":"+char+":");
        
        if (!char.match(/ /ig) && $(ev.currentTarget).val().length > 2) {
            GUIA.router.navigate('!/Search/' + $(ev.currentTarget).val());
            
            this.options.query = $(ev.currentTarget).val();
            
            if (this.timeoutId !== undefined) {
                clearTimeout(this.timeoutId);
            }

            var self = this;
            
            $('#searchevents').children().remove();
            $('#searchactors').children().remove();

            this.timeoutId = setTimeout(function () {
                var searchresult = new SearchresultModel();
                searchresult.fetch({
                    data: {
                        query: self.options.query
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