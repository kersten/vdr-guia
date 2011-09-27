var Program = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // <%= __("Program") %>');
    },
    render: function () {
        var template = _.template($("#program_template").html(), {});
        this.el.html(template);
    }
});