var EventView = Backbone.View.extend({
    url: "event",
    eventType: 'epg',

    events: {
        'click #showallposters': 'showallposters'
    },

    initialize: function () {
        if (this.options.params._id === undefined) {

        }
    },

    showallposters: function () {
        var mediaGrid = $('#showallpostersDialog').find('ul.media-grid');

        _.each(this.event.get('tmdb').posters, function (poster) {
            if (poster.image.size == 'thumb') {
                mediaGrid.append('<li><a><img class="thumbnail" src="' + poster.image.url + '"/></a></li>');
            }
        });

        $('#showallpostersDialog').modal({
            backdrop: true,
            keyboard: true,
            show: true
        });
    },

    generateHTML: function (callback) {
        if (this.options.params.action !== undefined && this.options.params.action == 'posters') {
            this.event.set({show: 'posters'});
        }

        callback.apply(this, [_.template(this.template, {event: this.event})]);
    },

    renderTemplate: function () {
        if (typeof(this.url) == 'undefined') {
            return this;
        }

        var self = this;
        this.event = new EventModel();

        this.event.fetch({
            data: {
                _id: this.options.params._id
            },
            success: function () {
                var event = self.event;

                if (event.get('tmdb') != null) {
                    var tmdb = event.get('tmdb');

                    console.log(tmdb);
                    self.eventType = 'tmdb';

                    if (tmdb.posters.length > 0) {
                        _.each(tmdb.posters, function (poster) {
                            if (poster.image.size == 'cover') {
                                event.set({image: poster.image.url});
                                return;
                            }
                        });
                    }

                    if (event.get('image') == null) {
                        event.set({'image': 'http://placehold.it/210x150&text=No%20Picture'});
                    }
                }

                if (event.get('description') != null) {

                }

                switch (self.eventType) {
                    case 'tmdb':
                        self.url = 'event/tmdb.html';
                        break;
                }

                $.ajax({
                    url: "/templates/" + self.url,
                    success: function (res) {
                        self.template = res;
                        self.event;
                        self.render();
                    }
                });
            }
        });

        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    self.template = res;
                    self.render();
                }
            });
        } else {
            this.render();
        }
    }
});
