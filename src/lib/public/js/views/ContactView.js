var ContactView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Contact');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/contact",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});