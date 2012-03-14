var ChannelSelectDialogView = Backbone.View.extend({
    template: 'ChannelSelectDialogTemplate',
    
    tagName: 'div',
    className: 'modal hide fade',

    events: {
        'click .selectChannel': 'switchChannel'
    },

    switchChannel: function (ev) {
        GUIA.router.navigate('!/TVGuide/' + this.options.date + '/' + $(ev.currentTarget).data('page'), true);
        $(this.el).modal('hide');
    },

    render: function (callback) {
        var self = this;
        this.model.fetch({
            data: {
                active: true
            }, success: function (collection) {
                var template = _.template( $('#' + self.template).html(), {channels: collection} );
                $(self.el).html( template );

                callback.apply(self, []);
            }
        });

        return this;
    }
});