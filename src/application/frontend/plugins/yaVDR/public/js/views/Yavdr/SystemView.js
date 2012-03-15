var YavdrSystemView = Backbone.View.extend({
    template: "yaVDRSystemTemplate",

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});