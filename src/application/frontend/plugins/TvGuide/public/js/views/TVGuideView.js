var TvGuideView = Backbone.View.extend({
    template: 'TvGuideTemplate',
    tagName: 'div',

    events: {
        // Bind clicks on the section (eg 5.00 - 12.00 o'clock)
        'click #guide > div.slideUp': 'slideUp',

        // Bind click on the select channels button
        'click .selectChannels': 'showChannelsDialog',

        // Bind click for changing date
        'TVGuidePagination:dateSwitched': 'load',

        'click .previousChannels': 'switchChannels',
        'click .nextChannels': 'switchChannels',
    },

    initialize: function () {
        var self = this;

        /*this.bind('TVGuidePagination:dateSwitched', function () {
            console.log('load new events');
        });*/

        // Create new XDate object
        var d = new XDate();

        // Write date to options, if it is not set create one
        this.options.date = this.options.date || d.toString('dd.MM.yyyy');

        /*if (parseInt(d.toString('HH')) >= 0 && parseInt(d.toString('HH')) < 5) {
            var checkNext = new XDate(this.options.date).addDays(-1).toString('dd.MM.yyyy');
            var yesterday = d.clone().addDays(-1).toString('dd.MM.yyyy');

            console.log(checkNext, yesterday);

            if (checkNext == yesterday) {
                this.options.date = yesterday;
            }
        }*/

        if (this.options.date == d.toString('dd.MM.yyyy')) {
            var showSection = parseInt(d.toString('HH'));

            if (showSection >= 5 && showSection < 12) {
                this.options.showSection = 'morning';
            } else if (showSection >= 12 && showSection < 18) {
                this.options.showSection = 'afternoon';
            } else if (showSection >= 18 && showSection < 20) {
                this.options.showSection = 'earlyevening';
            } else if (showSection >= 20 && showSection < 24) {
                this.options.showSection = 'evening';
            } else if (showSection >= 0 && showSection < 5) {
                this.options.showSection = 'night';
            }
        } else {
            this.options.showSection = 'all';
        }

        // Set current page, if it is not set set to 1
        this.options.page = this.options.page || 1;

        // Parse date string to XDate object
        this.options.date = new XDate(this.options.date);

        this.load();
    },

    showChannelsDialog: function () {
        // Load channels selection dialog
        var channelSelect = new ChannelSelectDialogView({
            model: new ChannelCollection(),
            date: this.options.date.toString('dd.MM.yyyy')
        });

        // Render the view
        channelSelect.render(function () {
            // Apply generated HTML to document.body
            $('body').append(this.el);

            // Find the first element and show the dialog
            $(this.el).modal({
                keyboard: true,
                backdrop: true,
                show: true
            });

            $(this.el).bind('hidden', function () {
                channelSelect.remove();
            });
        });
    },

    slideUp: function (ev) {
        // Check if current section is hidden
        if (!$(ev.currentTarget).hasClass('sectionHidden')) {
            // Hide current section and set it as hidden
            $('.' + $(ev.currentTarget).data('section')).slideUp();
            $(ev.currentTarget).addClass('sectionHidden');
        } else {
            // Show current section and set it as visible
            $('.' + $(ev.currentTarget).data('section')).slideDown();
            $(ev.currentTarget).removeClass('sectionHidden');
        }
    },

    load: function () {
        // Reference current view
        var self = this;

        // Load collection for channels
        this.tvguide = new TVGuideCollection();

        // Fetch channels for current page
        this.tvguide.fetch({
            data: {
                page: this.options.page
            }, success: function () {
                // Render template
                var template = _.template( $('#' + self.template).html(), {show: self.options.showSection} );
                $(self.el).html( template );

                // Get events
                self.getEvents(function () {
                    this.render();
                });
            }
        });
    },

    switchChannels: function (ev) {
        if ($(ev.currentTarget).hasClass('nextChannels')) {
            this.options.page++;
            GUIA.router.navigate('!/TVGuide/' + this.options.date.toString('dd.MM.yyyy') + '/' + this.options.page, true);
        } else {
            if (this.options.page != 1) {
                this.options.page--;
                GUIA.router.navigate('!/TVGuide/' + this.options.date.toString('dd.MM.yyyy') + '/' + this.options.page, true);
            }
        }
    },

    getEvents: function (callback) {
        // Reference current view
        var self = this;

        // Map over fetched channels
        async.map(this.tvguide, function (channel, callback) {
            // Fetch event from current channel for the passed date
            channel.events.fetch({
                data: {
                    date: {
                        year: self.options.date.toString('yyyy'),
                        month: self.options.date.toString('MM'),
                        day: self.options.date.toString('dd')
                    }
                }, success: function (events) {
                    // Finish step
                    callback(null, events);
                }
            });
        }, function (err, result) {
            // Set index to 0
            var index = 0;

            // Map (sync) over fetched channels
            async.mapSeries(self.tvguide, function (channel, callback) {
                // Increment index by 1
                index++;

                // render current channel and events
                self.renderEvents(channel, index, callback);
            }, function (err, result) {
                // All rendering is finished, callback for applying generated template to #body div
                callback.apply(self, []);
            });
        });
    },

    renderEvents: function (channel, index, callback) {
        // Clone the current date for manipulation
        var d = this.options.date.clone();

        // Load the channel view
        var channelView = new TVGuideChannelView({
            model: channel
        });

        // Attach the channel to the event guide
        $('#channels :nth-child(' + (index + 1) + ')', this.el).html(channelView.render());

        // Get event sections and attach events
        $(' #guide > .eventsection', this.el).each(function () {
            // Copy current section
            var el = this;

            // Get section time and set it to the date
            d.setHours($(el).data('from'));
            var starttime = d.getTime() / 1000;

            d.setHours($(el).data('to'));
            var stoptime = d.getTime() / 1000;

            // Iterate over every fetched event
            channel.events.forEach(function (event) {
                // Check if events start and stoptime matching the current section time
                if (event.get('start') >= starttime && event.get('start') < stoptime) {
                    // Get the hour div from current section
                    var sectionDiv = $(el).children('div[data-hour=\'' + parseInt(event.start_time().split(':')[0]) +'\']');
                    var eventDiv = $(sectionDiv).children(':nth-child(' + index + ')');

                    // Load the event view
                    var eventView = new TVGuideEventView({
                        model: event
                    });

                    // Render the event
                    eventDiv.append(eventView.render().el);
                }
            });
        });

        // Finished generating events and channel, return to getEvents
        callback(null, null);
    },

    render: function () {
        // Load the pagination (date) element
        var pagination = new TVGuidePaginationView({
            el: $(this.el).find('.pagination'),
            date: this.options.date.toString('dd.MM.yyyy'),
            page: this.options.page,
            parent: this
        });

        // Render the pagination (date) element
        pagination.render();

        // Append the generate HTML to the #body div
        $('#body').html(this.el);

        var top = $('#channels').offset().top - 40;
        var floating = false;

        $(window).unbind('scroll');
        $(window).scroll(function (event) {
            var y = $(this).scrollTop();

            if (y >= top) {
                if (!floating) {
                    floating = true;
                    $('#channels').clone().attr('id', 'channels_tmp').insertBefore($('#channels'));

                    $('#channels_tmp').css({
                        position: 'fixed',
                        top: 40,
                        width: $('#channels').width(),
                        zIndex: 999
                    });
                }
            } else {
                floating = false;
                $('#channels').css({
                    position: 'relative',
                    top: 0,
                    zIndex: '0'
                });

                $('#channels_tmp').remove();
            }
        });

        // Hide the loading spinner animation
        GUIA.loadingOverlay('hide');

        return this;
    },

    remove: function () {
        $(window).unbind('scroll');
        $(this.el).remove();
        return this;
    }
});