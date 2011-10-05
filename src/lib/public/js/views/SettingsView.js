var SettingsView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Settings');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/settings",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});