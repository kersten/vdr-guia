var SettingsChannelsChannelView = Backbone.View.extend({
    template: 'SettingsChannelsChannelTemplate',
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
            console.log(doc);
        });
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {channel: this.model} ));
        return this;
    }
});