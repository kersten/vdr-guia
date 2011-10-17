var SearchView = Backbone.View.extend({
    url: "search",
    
    events: {
        'click #showAdvancedSearchoptions': 'showAdvancedSearchoptions'
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
        
        
    }
});