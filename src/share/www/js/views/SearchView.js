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
            $('#searchinputfield').focus();
            break;
            
        case '-':
            $(event.currentTarget).text('+');
            $('#advancedSearchoptions').slideUp();
            $('#searchinputfield').focus();
            break;
        }
    },
    
    postRender: function () {
        $('#searchinputfield').focus();
    },
    
    search: function (event) {
        if (event.keyCode == 13) {
            $('#showAdvancedSearchoptions').text('+');
            $('#advancedSearchoptions').slideUp();
            
            $(event.currentTarget).attr('disabled', true);
            $(event.currentTarget).blur();
            
            Application.loadingOverlay('show');
            
            Application.loadSubView('/Searchresults', function (req, original) {
                Application.currentSubView.renderTemplate($(event.currentTarget).val(), 1, function () {
                    $(event.currentTarget).attr('disabled', false);
                });
            });
            
            return false;
        }
    }
});