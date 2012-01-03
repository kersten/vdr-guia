var TVGuideView = Backbone.View.extend({
    url: "tvguide",
    
    destructor: function () {
        $('.popover').die('hover');
        $('.record > img').die('hover');
        $('.record').die('click');
    },

    events: {
        'click .eventDetails': 'showEventDetails',
        'hover .eventDetails': 'showEventPopover',
        'click .slideUp': 'slideUp'
    },
    
    showEventDetails: function (ev) {
        $('.popover').remove();
        location.hash = '/Event/' + $(ev.currentTarget).attr('_id');
    },
    
    showEventPopover: function (ev) {
        var self = this;
        
        if (!$(ev.currentTarget).hasClass('isPrime')) {
            if (ev.type == 'mouseenter') {
                $(ev.currentTarget).popover('show');
                $(ev.currentTarget).css({textDecoration: 'underline'});
            } else {
                var popover = ev.currentTarget;
                
                self.popoverEl = popover;
                self.popoverId = setTimeout(function () {
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
        console.log('Record: ' + $(ev.currentTarget).attr('_id'));
    },
    
    handleRecordIcon: function (ev) {
        if (ev.type == 'mouseenter') {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle-2.png');
        } else {
            $(ev.currentTarget).attr('src', '/icons/devine/black/16x16/Circle.png');
        }
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

        var d = new XDate();
        var active = d.toString('dd.MM.yyyy');

        if (self.options.params.date !== undefined) {
            active = self.options.params.date;
        }

        d = new XDate(active);

        this.tvguide.fetch({data: {page: 1, date: {
            year: d.toString('yyyy'),
            month: d.toString('MM'),
            day: d.toString('dd')
        }}, success: function (collection) {
            callback.apply(this, [_.template(self.template, {events: collection, active: active})]);
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
            
            $('.popover').live('hover', {view: self}, self.handlePopover);
            $('.record > img').live('hover', self.handleRecordIcon);
            $('.record').live('click', self.recordEvent);

            Application.loadingOverlay('hide');

            if (typeof(self.postRender) == 'function') {
                self.postRender();
            }
        });

        return this;
    }
});