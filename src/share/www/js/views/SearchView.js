var SearchView = Backbone.View.extend({
    template: 'SearchTemplate',
    
    events: {},
    
    initialize: function () {
        /*if (this.options.query !== undefined) {
            $('#search').val(this.options.query);
            this.liveSearch();
        } else {
            this.options.query = '';
        }*/
        
        var self = this;
        
        $('#search').live('keydown', function () {
            self.options.query = $(this).val();
            self.liveSearch.apply(self);
        });
    },
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    },
    
    liveSearch: function () {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
        }
        
        if (this.options.query == '') {
            return;
        }
        
        var self = this;

        this.timeoutId = setTimeout(function () {
            var searchresult = new SearchresultModel();
            searchresult.fetch({
                data: {
                    query: self.options.query
                }, success: function () {
                    var eventsView = new SearchEventsView({
                        el: $('#searchevents', self.el),
                        model: searchresult.get('events')
                    });
                    
                    eventsView.render();
                    
                    var actorsView = new SearchActorsView({
                        el: $('#searchactors', self.el),
                        model: searchresult.get('actors')
                    });
                    
                    actorsView.render();
                    
                    GUIA.router.navigate('!/Search/' + $('#search').val());
                }
            });
        }, 300);
    }
});