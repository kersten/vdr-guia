var TVGuideView = Backbone.View.extend({
    url: "tvguide",

    generateHTML: function (callback) {
        var self = this;
        this.tvguide = new TVGuideCollection();

        this.tvguide.fetch({data: {page: 1},success: function (collection) {
                console.log(collection);
            callback.apply(this, [_.template(self.template, {events: collection})]);
        }});
    },

    render: function () {
        var self = this;

        this.generateHTML(function (res) {
            self.el.html(res);
            $(document).attr('title', $('#header_div').attr('title'));

            Application.loadingOverlay('hide');

            $('.slideup').click(function () {
                $(this).parent().removeClass('slideup').parent().addClass('slidedown');
                $(this).parent().find('.slideupTable').slideUp();
            });

            $('.slidedown').click(function () {
                $(this).parent().removeClass('slidedown').parent().addClass('slideup');
                $(this).parent().find('.slideupTable').slideDown();
            });

            $('.record').hover(function () {
                $(this).css({color: '#ff0000'});
            }, function () {
                $(this).css({color: '#000000'});
            });

            $('.eventDetails').hover(function () {
                if (!$(this).hasClass('isPrime')) {
                    $(this).css({textDecoration: 'underline'});
                }
            }, function () {
                if (!$(this).hasClass('isPrime')) {
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