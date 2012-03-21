var ChannelsEpgEntryView = Backbone.View.extend({
    template: 'ChannelsEpgEntryTemplate',

    render: function () {
        var recordBtn = new ButtonRecordView({
            model: this.model
        });

        var template = _.template( $('#' + this.template).html(), {model: this.model} );

        $(this.el).html( template );

        $(recordBtn.render().el).insertAfter($('h3', this.el));

        return this;
    }
});