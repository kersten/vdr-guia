var YavdrHardwareView = Backbone.View.extend({
    template: "yaVDRHardwareTemplate",

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});