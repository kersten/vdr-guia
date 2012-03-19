var YavdrNetworkView = Backbone.View.extend({
    template: "yaVDRNetworkTemplate",

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        if (this.options && this.options.tab) {
            $('li > a[href=#' + this.options.tab + ']', this.el).parent().addClass('active');
            $('#' + this.options.tab, this.el).addClass('active');
        } else {
            $('li:first', this.el).addClass('active');
            $('#' + $('li:first > a', this.el).attr('href'), this.el).addClass('active');
        }
    },

    render: function () {
        return this;
    }
});