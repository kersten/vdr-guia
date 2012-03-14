var ProfileView = Backbone.View.extend({
    template: 'ProfileTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});