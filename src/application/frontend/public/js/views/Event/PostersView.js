var EventPostersView = Backbone.View.extend({
    template: 'EventPostersTemplate',

    render: function () {
        var self = this;

        $(this.el).html(_.template($('#' + this.template).html(), {}));

        _.each(this.model, function (poster) {
            if (poster.image.size != 'mid') {
                return;
            }

            _.each(self.model, function (poster_thumb) {
                if (poster_thumb.image.size == 'thumb' && poster.image.id == poster_thumb.image.id) {
                    var posterView = new EventPostersPosterView({
                        poster: poster.image.url,
                        thumb: poster_thumb.image.url
                    });

                    $('ul', self.el).append(posterView.render().el);
                    return;
                }
            });
        });

        $('a.lightboxPoster', this.el).fancybox({
            openEffect: 'elastic',
            closeEffect: 'elastic',
            href: this.options.poster
        });

        return this;
    }
});