var SearchView = Backbone.View.extend({
    url: "search",
    
    events: {
        'click #showAdvancedSearchoptions': 'showAdvancedSearchoptions',
        'keypress #searchinputfield': 'search'
    },
    
    showAdvancedSearchoptions: function (event) {
        switch ($(event.currentTarget).text()) {
        case '+':
            $(event.currentTarget).text('-');
            $('#advancedSearchoptions').slideDown();
            break;
            
        case '-':
            $(event.currentTarget).text('+');
            $('#advancedSearchoptions').slideUp();
        }
    },
    
    search: function (event) {
        if (event.keyCode == 13) {
            $(event.currentTarget).attr('disabled', true);
            $(event.currentTarget).blur();
            
            Application.loadingOverlay('show');
            
            var SearchresultCollection = require('./SearchresultCollection');
            var searchresultCollection = new SearchresultCollection;
            
            var self = this;
            
            searchresultCollection.fetch({
                data: {
                    term: $(event.currentTarget).val()
                },
                
                success: function (collection) {
                    /*Application.loadView('/Event', function (req, original) {
                        Application.views[req].renderTemplate($(event.currentTarget).attr('channelid'), 1);
                    });*/
                    
                    console.log(collection);
                    
                    //$('#searchresults').append(_.template(self.template, {searchresults: collection}));
                }
            });
            
            return false;
        }
    }
});