var TVGuideView = Backbone.View.extend({
    url: "tvguide",

    initialize: function () {
        $('.popover').live('hover', {view: this}, this.handlePopover);
        $('.record > img').live('hover', this.handleRecordIcon);
        $('.record').live('click', this.recordEvent);

        $('.selectChannel').live('click', {view: this}, this.selectChannel);
    },

    destructor: function () {
        $('.popover').die('hover');
        $('.record > img').die('hover');
        $('.record').die('click');

        $('.selectChannel').die('click');

        $(this.el).children().remove();
        $(this.el).unbind();
    },

    events: {
        'click .eventDetails': 'showEventDetails',
        'hover .eventDetails': 'showEventPopover',
        'click .slideUp': 'slideUp',
        'click .selectChannels': 'showChannelsDialog'
    },

    showEventDetails: function (ev) {
        $('.popover').remove();
        location.hash = '/Event/' + $(ev.currentTarget).attr('_id');
    },

    showEventPopover: function (ev) {
        if (!$(ev.currentTarget).hasClass('isPrime')) {
            if (ev.type == 'mouseenter') {
                $(ev.currentTarget).popover('show');
                $(ev.currentTarget).css({textDecoration: 'underline'});
            } else {
                var popover = ev.currentTarget;

                this.popoverEl = popover;
                this.popoverId = setTimeout(function () {
                    $(popover).popover('hide');
                }, 100);

                $(ev.currentTarget).css({textDecoration: 'none'});
            }
        }
    },

    handlePopover: function (ev) {
        if (ev.type == 'mouseenter') {
            clearTimeout(ev.data.view.popoverId);
        } else {
            $(ev.data.view.popoverEl).popover('hide');
        }
    },

    recordEvent: function (ev) {
        location.hash = '/TVGuide/' + $(ev.currentTarget).attr('_id');
        console.log('Record: ' + $(ev.currentTarget).attr('_id'));
    },

    handleRecordIcon: function (ev) {
        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle-2.png');
        } else {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle.png');
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

    generateHTML: function (callback) {
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
                callback.apply(this, [_.template(self.template, {events: collection, channels: channels, active: active})]);
            }});
        }});
    },

    render: function () {
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