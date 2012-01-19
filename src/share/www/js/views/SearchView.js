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
        
        this.options.query = '';
        
        var self = this;
        
        /*$('#search').live('keydown', function (e) {
            var char = String.fromCharCode(e.keyCode|e.charCode);
            console.log(":"+char+":");
            
            if (!char.match(/ /ig) && $(this).val().length > 2) {
                GUIA.router.navigate('!/Search/' + $(this).val());
                
                self.options.query = $(this).val();
                self.liveSearch.apply(self);
            }
        });*/
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
                }
            });
        }, 300);
    },
    
    remove: function () {
        $('#search').die('keydown');
        
        $(this.el).remove();
        return this;
    }
});