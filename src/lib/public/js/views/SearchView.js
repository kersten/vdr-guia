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
            $('#showAdvancedSearchoptions').text('+');
            $('#advancedSearchoptions').slideUp();
            
            $(event.currentTarget).attr('disabled', true);
            $(event.currentTarget).blur();
            
            Application.loadingOverlay('show');
            
            Application.loadView('/Searchresults', function (req, original) {
                Application.views[req].renderTemplate($(event.currentTarget).val(), 1, function () {
                    $(event.currentTarget).attr('disabled', false);
                });
            });
            
            return false;
        }
    }
});