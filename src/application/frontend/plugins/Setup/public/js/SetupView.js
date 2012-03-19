var SetupView = Backbone.View.extend({
    template: 'SetupTemplate',

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadNextSite'
    },

    initialize: function () {
        $('ul.nav').remove();

        this.model = new ConfigurationModel();
    },

    loadNextSite: function (event) {
        this.remove();
        var view = new SetupSocializeView({
            model: this.model
        });

        $('#body').html(view.render().el);
    },

    render: function () {
        var template = _.template($('#' + this.template).html(), {});
        $(this.el).html(template);

        return this;
    }
});