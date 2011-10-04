var HightlightsView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Highlights');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/highlight",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});