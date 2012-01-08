var InstallView = Backbone.View.extend({
    tagname: 'div',

    initialize: function () {
        $(document).attr('title', 'GUIA // Installation');
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadNextSite'
    },

    loadNextSite: function (event) {
        this.remove();
        var view = new InstallSocializeView({
            model: this.model
        });

        $('#body').html(view.render().el);
    },

    render: function () {
        var template = _.template($('#InstallTemplate').html(), {});
        $(this.el).html(template);

        return this;
    }
});