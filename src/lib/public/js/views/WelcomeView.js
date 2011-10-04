var WelcomeView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/welcome",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});