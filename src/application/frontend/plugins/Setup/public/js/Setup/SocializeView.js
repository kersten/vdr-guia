var SetupSocializeView = Backbone.View.extend({
    template: 'SetupSocializeTemplate',

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function () {
        this.remove();
        var view = new SetupStepOneView({
            el: this.el,
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    loadPreviousSite: function () {
        this.remove();
        var view = new SetupView({
            el: this.el,
            model: this.model
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