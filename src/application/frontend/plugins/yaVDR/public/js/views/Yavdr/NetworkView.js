var YavdrNetworkView = Backbone.View.extend({
    template: "yaVDRNetworkTemplate",

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});