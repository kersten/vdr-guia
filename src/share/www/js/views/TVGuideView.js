var TVGuideView = Backbone.View.extend({
    url: "tvguide",
    template: 'TVGuideTemplate',
    el: '#body',

    initialize: function () {
        var d = new XDate();
        var active = d.toString('dd.MM.yyyy');
        var page = 1;

        if (this.options.params.date !== undefined) {
            active = this.options.params.date;
        }

        this.active = active;

        d = new XDate(active);

        if (this.options.params.page !== undefined) {
            page = this.options.params.page;
        }
        
        this.date = d;
        
        this.templateVars = {
            active: active,
            page: page
        };
        
        var self = this;
        
        this.tvguide = new TVGuideCollection();
        this.tvguide.fetch({
            data: {
                page: this.page,
            }, success: function () {
                self.getEvents();
            }
        });
        
        $('.popover').live('hover', {view: this}, this.handlePopover);
        $('.record > img').live('hover', this.handleRecordIcon);
        $('.record').live('click', this.recordEvent);

        $('.selectChannel').live('click', {view: this}, this.selectChannel);
    },

    destructor: function () {
        $('#selectChannelsDialog').remove();
        $('.modal-backdrop').remove();
        
        $('.popover').die('hover');
        $('.record > img').die('hover');
        $('.record').die('click');

        $('.selectChannel').die('click');

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
        $('#selectChannelsDialog').modal({
            keyboard: true,
            backdrop: true,
            show: true
        });
    },

    selectChannel: function (ev) {
        $('#selectChannelsDialog').modal('hide');
        location.hash = '/TVGuide/' + ev.data.view.active + '/' + $(ev.currentTarget).attr('page');
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

    /*generateHTML: function (callback) {
        var self = this;
        this.tvguide = new TVGuideCollection();
        this.channels = new ChannelCollection();

        var d = new XDate();
        var active = d.toString('dd.MM.yyyy');
        var page = 1;

        if (self.options.params.date !== undefined) {
            active = self.options.params.date;
        }

        this.active = active;

        d = new XDate(active);

        if (self.options.params.page !== undefined) {
            page = self.options.params.page;
        }

        this.tvguide.fetch({data: {page: page, date: {
            year: d.toString('yyyy'),
            month: d.toString('MM'),
            day: d.toString('dd')
        }}, success: function (collection) {
            
            self.channels.fetch({data: {active: true}, success: function (channels) {
                callback.apply(this, [_.template(self.template, {events: collection, channels: channels, active: active, page: page})]);
            }});
        }});
    },*/
    
    getEvents: function () {
        var self = this;
        
        this.tvguide.forEach(function (channel, index) {
            channel.events.fetch({
                data: {
                    date: {
                        year: self.date.toString('yyyy'),
                        month: self.date.toString('MM'),
                        day: self.date.toString('dd')
                    }
                }, success: function (events) {
                    self.renderEvents(channel, events, index);
                }
            });
        });
    },
    
    renderEvents: function (channel, events, index) {
        var d = this.date.clone();
        
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
        var template = _.template( $('#' + this.template).html(), this.templateVars );
        $(this.el).html( template );
        
        GUIA.loadingOverlay('hide');
        
        return;
        
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