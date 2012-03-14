var InstallSocializeView = Backbone.View.extend({
    tagName: 'div',

    initialize: function () {
        $(document).attr('title', 'GUIA // Installation // Socialize');
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function () {
        this.remove();
        var view = new InstallStepOneView({
            el: this.el,
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    loadPreviousSite: function () {
        this.remove();
        var view = new InstallView({
            el: this.el,
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#InstallSocializeTemplate').html(), {});
        $(this.el).html(template);

        return this;
    }
});