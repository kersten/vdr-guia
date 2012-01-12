var EventPostersView = Backbone.View.extend({
    template: 'EventPostersTemplate',
    
    events: {
        'click .lightboxPoster': 'lightboxPoster'
    },

    lightboxPoster: function (ev) {
        var id = $(ev.currentTarget).data('id');

        _.each(this.model, function (poster) {
            if (poster.image.size == 'mid' && poster.image.id == id) {
                
                console.log($(ev.currentTarget).parent());
                $(ev.currentTarget).fancybox({
                    openEffect: 'elastic',
                    closeEffect: 'elastic',
                    href: poster.image.url
                });
            }
        });
    },
    
    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {posters: this.model} ));
        return this;
    }
});