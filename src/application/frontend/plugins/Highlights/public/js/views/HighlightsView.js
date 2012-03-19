var HighlightsView = Backbone.View.extend({
    template: 'HighlightsTemplate',
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        return this;
    }
});