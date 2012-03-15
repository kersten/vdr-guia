var YavdrToolsView = Backbone.View.extend({
    template: "yaVDRToolsTemplate",

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});