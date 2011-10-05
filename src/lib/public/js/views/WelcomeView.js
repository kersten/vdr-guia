var WelcomeView = Backbone.View.extend({
    template: null,
    
    initialize: function () {
        $(document).attr('title', 'GUIA');
    },
    
    render: function () {
        var self = this;
        
        if (this.template == null) {
            $.ajax({
                url: "/templates/welcome",
                success: function (res) {
                    self.template = res;
                    var template = _.template(res, {});
                    self.el.html(template);
                }
            });
        } else {
            var template = _.template(this.template, {});
            self.el.html(template);
        }
        
        return this;
    }
});