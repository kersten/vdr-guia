var WelcomeView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA');
    },
    
    render: function () {
        // Compile the template using underscore
        var template = _.template( $("#WelcomeViewTemplate").html(), {} );
        // Load the compiled HTML into the Backbone "el"
        this.el.html( template );
        return this;
    }
});