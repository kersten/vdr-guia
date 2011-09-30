var InstallView = Backbone.View.extend({
    
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation');
        this.render();
    },
    
    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadNextSite'
    },
    
    loadNextSite: function (event) {
        var nextSite = $(event.currentTarget).attr('next') + 'Template';
        var template = _.template( $("#" + nextSite).html(), {} );
        
        this.el.html( template );
        return this;
    },
    
    render: function () {
        // Compile the template using underscore
        var template = _.template( $("#InstallViewTemplate").html(), {} );
        // Load the compiled HTML into the Backbone "el"
        this.el.html( template );
        return this;
    }
});