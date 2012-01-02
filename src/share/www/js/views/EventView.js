var EventView = Backbone.View.extend({
    url: "event",
    eventType: 'epg',

    events: {
        'click #showallposters': 'showallposters',
        'click .lightboxPoster': 'lightboxPoster',
        'click .recordThis > img': 'recordEvent',
        'hover .recordThis > img': 'hoverRecordEvent'
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

    lightboxPoster: function (ev) {
        var id = $(ev.currentTarget).attr('id').split('_');
        id = id[1];

        _.each(this.event.get('tmdb').posters, function (poster) {
            if (poster.image.size == 'mid' && poster.image.id == id) {
                $('#a_' + $(ev.currentTarget).attr('id')).fancybox({
                    openEffect: 'elastic',
                    closeEffect: 'elastic',
                    href: poster.image.url
                });
            }
        });
    },

    recordEvent: function (ev) {
        if (this.event.get('timer_active')) {
            console.log('Delete timer for: ' + this.event.get('_id'));
            this.event.set({timer_active: false});
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle.png');
        } else {
            console.log('Create timer for: ' + this.event.get('_id'));
            this.event.set({timer_active: true});
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle-2.png');
        }
    },
    
    hoverRecordEvent: function (ev) {
        var image = '';
        var image_record = '-2';
        
        if (this.event.get('timer_active')) {
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
