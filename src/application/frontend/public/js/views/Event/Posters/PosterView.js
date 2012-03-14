var EventPostersPosterView = Backbone.View.extend({
    template: 'EventPostersPosterTemplate',
    tagName: 'li',
    
    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {poster: this.options.poster, thumb: this.options.thumb} ));
        $(this.el).css({cursor: 'pointer'});
    },
    
    render: function () {
        return this;
    }
});