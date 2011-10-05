var TimerView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Timer');
    },
    
    render: function () {
        var self = this;
        
        $.ajax({
            url: "/templates/timer",
            success: function (res) {
                var template = _.template(res, {});
                self.el.html(template);
            }
        });
        
        return this;
    }
});