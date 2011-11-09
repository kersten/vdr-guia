var MenuView = Backbone.View.extend({
    initialize: function () {
        
    },
    render: function () {
        var template = _.template($("#menu_template").html(), {});
        $('#menu').html(template);
    }
});