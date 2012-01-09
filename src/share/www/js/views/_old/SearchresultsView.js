var SearchresultsView = Backbone.View.extend({
    url: "program/events",
    eventDiv: null,
    originalDiv: null,
    
    events: {
        'click .eventitem': 'showEvent'
    },
    
    showEvent: function (event) {
        Application.showEvent(event);
    },
    
    generateHTML: function (callback) {
        var self = this;
        
        var eventCollection = new EventCollection;
        eventCollection.url = 'SearchresultCollection';

        eventCollection.fetch({
            data: {
                page: this.page,
                term: this.query
            },

            success: function (collection) {
                $('#container_searchresults').css({
                    maxHeight: $(window).height() - $('body').height() - 40,
                    height: $(window).height() - $('body').height() - 40,
                    overflow: 'auto',
                    position: 'relative'
                });
                
                callback.apply(this, [_.template(self.template, {events: collection, preloaded: false})]);
                
                $('#container_searchresults').endlessScroll({
                    callback: function (p) {
                        Application.loadingOverlay('show');
                        self.page = p + 1;
                        eventCollection.fetch({data: {term: self.query, page: self.page}, success: function (collection) {
                            if (collection.length == 0) {
                                $('#container_searchresults').unbind('scroll');
                            }
                            
                            var events = _.template(self.template, {events: collection, preloaded: true});
                            $('#searchresults').append(events);
                            
                            Application.loadingOverlay('hide');
                        }});
                    }
                });
                
                var newSearchtimer = $('#createNewSearchtimer');
                
                newSearchtimer.css({
                    position: 'absolute',
                    top: (($('#searchinputfield').height() - newSearchtimer.outerHeight()) / 2) + ($('#searchinputfield').height() - newSearchtimer.outerHeight()),
                    left: $('#searchinputfield').width() - newSearchtimer.outerWidth(),
                    cursor: 'pointer'
                }).click(function (event) {
                    Application.loadSubView('/Searchtimer', function (req, original) {
                        Application.views[req].openDialog($(event.currentTarget));
                    });
                });
                
                if (typeof(Application.vdr.plugins.epgsearch) != 'undefined' && collection.length != 0) {
                    newSearchtimer.fadeIn();
                }
            }
        });
    },
    
    render: function (callback) {
        if (this.template == null) {
            return this;
        }
        
        this.generateHTML(function (res) {
            $('#searchresults').html(res);
            $('.timer_active').blinky();
            
            callback.call();
            Application.loadingOverlay('hide');
        });
    },
    
    renderTemplate: function (query, page, callback) {
        this.query = query,
        this.page = page;
        
        var self = this;
    
        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    self.template = res;
                    self.render(callback);
                }
            });
        } else {
            this.render(callback);
        }
    }
});