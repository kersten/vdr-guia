var TVGuidePaginationView = Backbone.View.extend({
    template: 'TVGuidePaginationTemplate',
    
    events: {
        'click li:not(.active)': 'switchDate'
    },
    
    switchDate: function (ev) {
        GUIA.router.navigate('!/TVGuide/' + $(ev.currentTarget).data('date') + '/' + $(ev.currentTarget).data('page'), true);
    },
    
    render: function () {
        var template = _.template( $('#' + this.template).html(), {active: this.options.date, page: this.options.page} );
        $(this.el).html(template);
        
        return this;
    }
});