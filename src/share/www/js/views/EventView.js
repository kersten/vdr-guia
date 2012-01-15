var EventView = Backbone.View.extend({
    template: 'EventTemplate',

    events: {
        'click a.showDetails': 'showDetails',
    },

    showDetails: function (ev) {
        switch ($(ev.currentTarget).data('view')) {
        case 'cast':
            this.renderCast();
            GUIA.router.navigate('!/Event/' + this.model.get('_id') + '/cast');

            break;

        case 'person':
            GUIA.router.navigate('!/Person/' + $(ev.currentTarget).data('personid'), true);
            break;

        case 'posters':
            this.renderPosters();
            GUIA.router.navigate('!/Event/' + this.model.get('_id') + '/posters');
            break;

        case 'event':
            this.renderDescription();
            GUIA.router.navigate('!/Event/' + this.model.get('_id'));
            break;
        }
    },

    renderDescription: function () {
        if (this.descriptionView === undefined) {
            this.descriptionView = new EventDescriptionView({
                model: this.model,
                el: $('.eventDescription', this.el)
            });
        }

        this.descriptionView.render();
    },

    renderPosters: function () {
        if (this.postersView === undefined) {
            this.postersView = new EventPostersView({
                model: this.model.get('posters'),
                el: $('.eventDescription', this.el)
            });
        }

        this.postersView.render();
    },

    renderCast: function () {
        if (this.castView === undefined) {
            this.castView = new EventCastView({
                model: this.model,
                el: $('.eventDescription', this.el)
            });
        }

        this.castView.render();
    },

    render: function (callback) {
        var self = this;

        this.model.fetch({
            data: {
                _id: this.options._id
            },
            success: function (event) {
                if (event.get('tmdb') != null) {
                    var tmdb = event.get('tmdb');

                    //console.log(tmdb);
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

                var start = new XDate(event.get('start') * 1000);

                event.set({start_formatted: start.toString('HH:mm')});
                event.set({date: start.toString('dd.MM')});

                console.log(event);

                var recordView = new EventRecordButtonView({
                    model: event
                });

                recordView.render();

                var template = _.template( $('#' + self.template).html(), {event: event} );
                $(self.el).html( template );
                $('.recordThis', self.el).append(recordView.el);

                switch (self.options.view) {
                case 'posters':
                    self.renderPosters();
                    break;

                case 'cast':
                    self.renderCast();
                    break;

                default:
                    self.renderDescription();
                    break;
                }

                callback.apply(self, []);
            }
        });

        return this;
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

                    //console.log(tmdb);
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

                var start = new XDate(event.get('start') * 1000);

                event.set({start_formatted: start.toString('HH:mm')});
                event.set({date: start.toString('dd.MM')});

                switch (self.eventType) {
                    case 'tmdb':
                        self.url = 'event/tmdb.html';
                        break;
                }

                console.log(event);

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
