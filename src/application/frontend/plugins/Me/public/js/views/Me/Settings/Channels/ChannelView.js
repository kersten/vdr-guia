var MeSettingsChannelsChannelView = Backbone.View.extend({
    template: 'MeSettingsChannelsChannelTemplate',
    tagName: 'tr',

    events: {
        'change input': 'changeState'
    },

    changeState: function (ev) {
        if ($(ev.currentTarget).is(':checked')) {
            this.model.set({active: true});
        } else {
            this.model.set({active: false});
        }

        this.model.save(function (doc) {
        });
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {channel: this.model} ));
        return this;
    }
});