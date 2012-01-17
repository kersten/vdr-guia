var ShortcutsView = Backbone.View.extend({
    template: 'ShortcutsTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});