var SettingsChannelsView = Backbone.View.extend({
    template: 'SettingsChannelsTemplate',
    className: 'span14 columns',

    events: {
        'change #selectAllChannels': 'changeAllStates'
    },

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        this.channellist = new ChannelCollection();

        var self = this;
        this.channellist.fetch({
            success: function (collection) {
                collection.forEach(function (channel) {
                    var channelView = new SettingsChannelsChannelView({
                        model: channel
                    });

                    $('#channels > tbody', self.el).append(channelView.render().el);
                });
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

