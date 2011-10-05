var SearchtimerView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Seacrhtimer');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/searchtimer",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});