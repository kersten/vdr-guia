var MeSettingsChannelsView = Backbone.View.extend({
    template: 'MeSettingsChannelsTemplate',
    className: 'span9 columns',

    events: {
        'change #selectAllChannels': 'changeAllStates'
    },

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        //GUIA.loadingOverlay('show');

        this.channellist = new ChannelCollection();

        var self = this;
        this.channellist.fetch({
            success: function (collection) {
                $('#channels > tbody', self.el).children().remove();
                $('#channels').addClass('table-striped');

                collection.forEach(function (channel) {
                    var channelView = new MeSettingsChannelsChannelView({
                        model: channel
                    });

                    $('#channels > tbody', self.el).append(channelView.render().el);
                });

                //GUIA.loadingOverlay('hide');
            }
        });
    },

    changeAllStates: function (ev) {
        if ($(ev.currentTarget).is(':checked')) {
            $('input.channel', this.el).attr('checked', true);
        } else {
            $('input.channel', this.el).attr('checked', false);
        }

        $('input.channel', this.el).trigger('change');
    },

    render: function () {
        return this;
    }
});

