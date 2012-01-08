var InstallStepThreeView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation // Finish');
    },

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
        var view = new InstallSelectChannelView({
            model: self.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#InstallStepThreeTemplate').html(), {});
        $(this.el).html(template);

        return this;
    }
});