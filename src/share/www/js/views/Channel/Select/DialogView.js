var ChannelSelectDialogView = Backbone.View.extend({
    template: 'ChannelSelectDialogTemplate',
    
    events: {
        'click li:not(.active)': 'switchChannel'
    },
    
    switchChannel: function (ev) {
        GUIA.router.navigate('!/TVGuide/' + $(ev.currentTarget).data('date') + '/' + $(ev.currentTarget).data('page'), true);
    },
    
    render: function () {
        var self = this;
        this.model.fetch({
            data: {
                active: true
            }, success: function (collection) {
                var template = _.template( $('#' + self.template).html(), {channels: collection} );
                $(self.el).html(template);
                
                $('#selectChannelsDialog').modal({
                    keyboard: true,
                    backdrop: true,
                    show: true
                });
            }
        });
        
        return this;
    }
});