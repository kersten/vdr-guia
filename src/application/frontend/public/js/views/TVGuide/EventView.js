var TVGuideEventView = Backbone.View.extend({
    template: 'TVGuideEventTemplate',
    tagName: 'div',

    events: {
        'click td.event': 'showEventDetails'
    },

    showEventDetails: function (ev) {
        $(this.el).popover('hide');
        $('#body').scrollTop();
        GUIA.router.navigate('!/Event/' + this.model.get('_id'), true);
    },

    render: function () {
        var self = this;

        var template = _.template( $('#' + this.template).html(), {event: this.model} );
        $(this.el).html(template);

        var recordButton = new ButtonRecordView({
            model: this.model
        });

        recordButton.render();
        $('.recordThis', this.el).append(recordButton.el);

        return this
    }
});