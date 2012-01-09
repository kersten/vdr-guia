var HelpShortcutsView = Backbone.View.extend({
    template: 'HelpShortcutsTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});