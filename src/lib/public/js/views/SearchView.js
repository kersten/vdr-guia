var SearchView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Search');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/search",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});