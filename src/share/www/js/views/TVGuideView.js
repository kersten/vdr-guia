var TVGuideView = Backbone.View.extend({
    template: 'TVGuideTemplate',
    tagName: 'div',

    initialize: function () {
        // Create new XDate object and set date defaults
        var d = new XDate();
        this.options.date = this.options.date || d.toString('dd.MM.yyyy');
        this.options.page = this.options.page || 1;

        // Parse date string to XDate object
        this.options.date = new XDate(this.options.date);

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
                var template = _.template( $('#' + self.template).html(), {} );
                $(self.el).html( template );
                
                // Get events
                self.getEvents(function () {
                    this.render();
                });
            }
        });
    },

    events: {
        'click #guide > div.slideUp': 'slideUp',
        'click .selectChannels': 'showChannelsDialog'
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
        $(this.el).find('#channels :nth-child(' + index + ')').html(channelView.render());
        
        // Get event sections and attach events
        $(this.el).find(' #guide > .eventsection').each(function () {
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
                        model: event,
                        el: eventDiv
                    });

                    // Render the event
                    eventView.render();
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
            page: this.options.page
        });

        // Render the pagination (date) element
        pagination.render();

        // Append the generate HTML to the #body div
        $('#body').html(this.el);
        
        // Hide the loading spinner animation
        GUIA.loadingOverlay('hide');
        
        return this;
    }
});