var TVGuideView = Backbone.View.extend({
    url: "tvguide",
    template: 'TVGuideTemplate',
    el: '#body',

    initialize: function () {
        var d = new XDate();
        this.options.date = this.options.date || d.toString('dd.MM.yyyy');
        this.options.page = this.options.page || 1;

        this.options.date = new XDate(this.options.date);
        
        var self = this;
        
        this.tvguide = new TVGuideCollection();
        this.tvguide.fetch({
            data: {
                page: this.options.page
            }, success: function () {
                self.getEvents();
            }
        });
    },

    destructor: function () {
        $('#selectChannelsDialog').remove();
        $('.modal-backdrop').remove();
        
        $('.popover').die('hover');
        $('.record > img').die('hover');
        $('.record').die('click');

        $(this.el).children().remove();
        $(this.el).unbind();
    },

    events: {
        'click .slideUp': 'slideUp',
        'click .selectChannels': 'showChannelsDialog'
    },

    handlePopover: function (ev) {
        if (ev.type == 'mouseenter') {
            clearTimeout(ev.data.view.popoverId);
        } else {
            $(ev.data.view.popoverEl).popover('hide');
        }
    },

    recordEvent: function (ev) {
        var image = '-2';
        var timer_active = true;
        
        if ($(ev.currentTarget).find('img').attr('timer_active') == "true") {
            image = '';
            timer_active = false;
        }
        
        $(ev.currentTarget).find('img').attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
        $(ev.currentTarget).find('img').attr('timer_active', timer_active);
        
        console.log('Record: ' + $(ev.currentTarget).attr('_id'));
    },

    handleRecordIcon: function (ev) {
        var image = '';
        var image_record = '-2';
        
        if ($(ev.currentTarget).attr('timer_active') == "true") {
            image = '-2';
            image_record = '';
        }
        
        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image_record + '.png');
        } else {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle' + image + '.png');
        }
    },

    showChannelsDialog: function () {
        var channelSelect = new ChannelSelectDialogView({
            model: new ChannelCollection(),
            el: '#modal'
        });
        
        channelSelect.render();
    },

    selectChannel: function (ev) {
        $('#selectChannelsDialog').modal('hide');
        GUIA.router.navigate('!/TVGuide/' + ev.data.view.active + '/' + $(ev.currentTarget).attr('page'), true);
    },

    slideUp: function (ev) {
        if ($(ev.currentTarget).hasClass('sectionHidden')) {
            $('.section_' + $(ev.currentTarget).attr('section')).show();
            $(ev.currentTarget).removeClass('sectionHidden');
        } else {
            $('.section_' + $(ev.currentTarget).attr('section')).hide();
            $(ev.currentTarget).addClass('sectionHidden');
        }
    },
    
    getEvents: function () {
        var self = this;
        
        this.tvguide.forEach(function (channel, index) {
            channel.events.fetch({
                data: {
                    date: {
                        year: self.options.date.toString('yyyy'),
                        month: self.options.date.toString('MM'),
                        day: self.options.date.toString('dd')
                    }
                }, success: function (events) {
                    self.renderEvents(channel, events, index);
                }
            });
        });
    },
    
    renderEvents: function (channel, events, index) {
        var d = this.options.date.clone();
        
        var channelView = new TVGuideChannelView({
            model: channel
        });
            
        $('#channels :nth-child(' + (index + 1) + ')').html(channelView.render());
        
        $('#guide > .eventsection').each(function () {
            var el = this;
            var sectionDiv = $(el).children(':nth-child(' + (index + 1) + ')');
            
            d.setHours($(el).data('from'));
            var starttime = d.getTime() / 1000;
            
            d.setHours($(el).data('to'));
            var stoptime = d.getTime() / 1000;
            
            events.forEach(function (event) {
                if (event.get('start') >= starttime && event.get('start') < stoptime) {
                    var sectionDiv = $(el).children('div[data-hour=\'' + parseInt(event.start_time().split(':')[0]) +'\']');
                    var eventDiv = $(sectionDiv).children(':nth-child(' + (index + 1) + ')');
                    
                    var eventView = new TVGuideEventView({
                        model: event,
                        el: eventDiv
                    });
                    
                    eventView.render();
                    
                    //eventDiv.append(eventView.render());
                }
            });
        });   
        
        return;
        
        
        events.forEach(function (event) {
            var eventView = new TVGuideEventView({
                model: event
            });
        });
    },

    render: function () {
        var template = _.template( $('#' + this.template).html(), {} );
        $(this.el).html( template );
        
        var pagination = new TVGuidePaginationView({
            el: $(this.el).find('.pagination'),
            date: this.options.date.toString('dd.MM.yyyy'),
            page: this.options.page
        });
        
        pagination.render();
        
        GUIA.loadingOverlay('hide');
        
        return this;
        
        var self = this;

        this.generateHTML(function (res) {
            self.el.html(res);
            $(document).attr('title', $('#header_div').attr('title'));

            $('.eventDetails').popover({
                placement: 'left',
                trigger: 'manual',
                html: true
            });

            Application.loadingOverlay('hide');

            if (typeof(self.postRender) == 'function') {
                self.postRender();
            }
        });

        return this;
    }
});