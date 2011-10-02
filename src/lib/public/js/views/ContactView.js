var ContactView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Contact');
    },
    
    render: function () {
        // Compile the template using underscore
        var template = _.template( $("#ContactViewTemplate").html(), {} );
        // Load the compiled HTML into the Backbone "el"
        this.el.html( template );
        return this;
    }
});