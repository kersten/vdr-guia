var TVGuidePaginationView = Backbone.View.extend({
    template: 'TVGuidePaginationTemplate',

    events: {
        'click li:not(.active)': 'switchDate'
    },

    switchDate: function (ev) {
        $('li.active', this.el).removeClass('active');
        $(ev.currentTarget).addClass('active');

        GUIA.router.navigate('!/TVGuide/' + $(ev.currentTarget).data('date') + '/' + $(ev.currentTarget).data('page'), true);

        this.options.parent.trigger('TVGuidePagination:dateSwitched');
    },

    render: function () {
        var template = _.template( $('#' + this.template).html(), {active: this.options.date, page: this.options.page} );
        $(this.el).html(template);

        return this;
    }
});