var YavdrCommandsView = Backbone.View.extend({
    template: "yaVDRCommandsTemplate",

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});