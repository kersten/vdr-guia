var RecordingsView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Recordings');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/recordings",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});