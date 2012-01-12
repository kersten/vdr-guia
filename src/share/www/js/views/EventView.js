var EventView = Backbone.View.extend({
    template: 'EventTemplate',
    eventType: 'epg',

    events: {
        'click a.showDetails': 'showDetails',
        'click .recordThis > img': 'recordEvent',
        'hover .recordThis > img': 'hoverRecordEvent'
    },
    
    showDetails: function (ev) {
        switch ($(ev.currentTarget).data('view')) {
        case 'cast':
            this.showCast();
            GUIA.router.navigate('!/Event/' + this.model.get('_id') + '/cast');
            
            break;
            
        case 'person':
            GUIA.router.navigate('!/Peson/' + $(ev.currentTarget).data('personId'), true);
            break;
            
        case 'posters':
            this.showPosters();
            GUIA.router.navigate('!/Event/' + this.model.get('_id') + '/posters');
            break;
            
        case 'event':
            this.showDescription();
            GUIA.router.navigate('!/Event/' + this.model.get('_id'));
            break;
        }
    },
    
    showDescription: function () {
        if (this.descriptionView === undefined) {
            this.descriptionView = new EventDescriptionView({
                model: this.model,
                el: $('.eventDescription', this.el)
            });
        }
        
        this.descriptionView.render();
    },

    showPosters: function () {
        if (this.postersView === undefined) {
            this.postersView = new EventPostersView({
                model: this.model.get('tmdb').posters,
                el: $('.eventDescription', this.el)
            });
        }
        
        this.postersView.render();
    },
    
    showCast: function () {
        if (this.castView === undefined) {
            this.postersView = new EventCastView({
                model: this.model.get('tmdb'),
                el: $('.eventDescription', this.el)
            });
        }
        
        this.postersView.render();
    },

    recordEvent: function (ev) {
        if (this.model.get('timer_active')) {
            console.log('Delete timer for: ' + this.model.get('_id'));
            this.model.set({timer_active: false});
            
            this.model.save();
        } else {
            console.log('Create timer for: ' + this.model.get('_id'));
            this.model.set({timer_active: true});
            
            this.model.save();
        }
    },

    hoverRecordEvent: function (ev) {
        var image = '';
        var image_record = '-2';

        if (this.model.get('timer_active')) {
            image = '-2';
            image_record = '';
        }

        switch (ev.type) {
            case 'mouseenter':
                $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image_record + '.png');
                break;

            case 'mouseleave':
                $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
                break;
        };
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

                switch (self.eventType) {
                    case 'tmdb':
                        self.template = 'EventTmdbTemplate';
                        break;
                }

                var template = _.template( $('#' + self.template).html(), {event: event} );
                $(self.el).html( template );
                
                switch (self.options.view) {
                case 'posters':
                    self.showPosters();
                    break;
                    
                case 'cast':
                    self.showCast();
                    break;
                
                default:
                    self.showDescription();
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
