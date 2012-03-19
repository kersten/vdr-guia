var SetupStepThreeView = Backbone.View.extend({
    template: 'SetupStepThreeTemplate',

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function () {
        socket.emit('Install:redirect', {}, function () {
            location.reload(true);
        });
        
        return;
    },

    loadPreviousSite: function () {
        var view = new SetupSelectChannelView({
            model: self.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#' + this.template).html(), {});
        $(this.el).html(template);

        return this;
    }
});