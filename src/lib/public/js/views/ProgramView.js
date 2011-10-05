var ProgramView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Program');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/program",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});