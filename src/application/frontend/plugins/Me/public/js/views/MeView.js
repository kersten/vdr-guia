var MeView = Backbone.View.extend({
    template: 'MeTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});