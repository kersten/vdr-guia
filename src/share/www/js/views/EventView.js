var EventView = Backbone.View.extend({
    template: 'EventTemplate',

    events: {
        'click a.showDetails': 'showDetails',
        'hover .isSeries': 'highlightNextBroadcast',
        'click .isSeries': 'showNextBroadcast',
        'click .showcast': 'showCast',
        'hover .recordThis': 'recordThis',
        'click .amazonbuy': 'buyOnAmazon'
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

    highlightNextBroadcast: function (ev) {
        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).css({
                backgroundColor: '#DCEAF4'
            });
        } else {
            $(ev.currentTarget).css({
                backgroundColor: ''
            });
        }
    },

    showNextBroadcast: function (ev) {
        GUIA.router.navigate('!/Event/' + $(ev.currentTarget).data('id'), true);
    },
    
    showCast: function () {
        
    },
    
    recordThis: function (ev) {
        if (ev.type == 'mouseenter') {
            if (this.model.get('timer_exists') == true) {
                $(ev.currentTarget).addClass('success');
                $(ev.currentTarget).removeClass('important');
            } else {
                $(ev.currentTarget).addClass('important');
                $(ev.currentTarget).removeClass('success');
            }
        } else {
            if (this.model.get('timer_exists') == true) {
                $(ev.currentTarget).addClass('important');
                $(ev.currentTarget).removeClass('success');
            } else {
                $(ev.currentTarget).addClass('success');
                $(ev.currentTarget).removeClass('important');
            }
        }
    },
    
    buyOnAmazon: function () {
        // http://www.amazon.de/gp/search?index=aps&url=search-alias%3Ddvd&tag=meiblo05-21&keywords=
        location.href = 'http://www.amazon.de/gp/search?index=aps&url=search-alias%3Ddvd&tag=meiblo05-21&keywords=' + this.model.get('title')
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
                        event.set({'image': ''});
                    }
                }

                var start = new XDate(event.get('start') * 1000);

                event.set({start_formatted: start.toString('HH:mm')});
                event.set({date: start.toString('dd.MM')});

                console.log(event);

                //var recordView = new EventRecordButtonView({
                //    model: event
                //});

                //recordView.render();

                var template = _.template( $('#' + self.template).html(), {event: event} );
                $(self.el).html( template );
                //$('.recordThis', self.el).append(recordView.el);
                
                if (event.get('stop') * 1000 < new Date().getTime()) {
                    $('.recordThis', self.el).remove();
                }

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
    }
});
