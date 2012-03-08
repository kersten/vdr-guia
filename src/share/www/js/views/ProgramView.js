var ProgramView = Backbone.View.extend({
    template: 'ProgramTemplate',

    initialize: function () {
        var self = this;

        this.collection = new ChannelCollection();

        this.collection.fetch({
            data: {
                active: true
            }, success: function (collection) {
                console.log(collection);
                var template = _.template( $('#' + self.template).html(), {channels: collection} );
                $(self.el).html( template );
            }
        });
    },

    render: function () {
        return this;
    }
});