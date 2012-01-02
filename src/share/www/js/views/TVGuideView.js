var TVGuideView = Backbone.View.extend({
    url: "tvguide",

    events: {
        'click .slideUp': 'slideUp'
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
            active = self.options.params.date
        }

        d = new XDate(active);

        this.tvguide.fetch({data: {page: 1, date: {
            year: d.toString('yyyy'),
            month: d.toString('MM'),
            day: d.toString('dd')
        }}, success: function (collection) {
            console.log(collection)
            callback.apply(this, [_.template(self.template, {events: collection, active: active})]);
        }});
    },

    render: function () {
        var self = this;

        this.generateHTML(function (res) {
            self.el.html(res);
            $(document).attr('title', $('#header_div').attr('title'));

            Application.loadingOverlay('hide');

            /*$('.slideup').click(function () {
                $(this).parent().removeClass('slideup').parent().addClass('slidedown');
                $(this).parent().find('.slideupTable').slideUp();
            });

            $('.slidedown').click(function () {
                $(this).parent().removeClass('slidedown').parent().addClass('slideup');
                $(this).parent().find('.slideupTable').slideDown();
            });*/

            $('.eventDetails').hover(function () {
                console.log($(this).popover('show'));
                $(this).popover('show');

                if (!$(this).hasClass('isPrime')) {

                    $(this).css({textDecoration: 'underline'});
                }
            }, function () {
                if (!$(this).hasClass('isPrime')) {
                    $(this).popover('hide');
                    $(this).css({textDecoration: 'none'});
                }
            });

            $('.eventDetails').click(function () {
                location.hash = '/Event/' + $(this).parent().attr('_id');
            });

            $('.record').click(function () {
                location.hash = '/Event/' + $(this).parent().attr('_id');
            });

            if (typeof(self.postRender) == 'function') {
                self.postRender();
            }
        });

        return this;
    }
});