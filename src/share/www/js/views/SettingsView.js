var SettingsView = Backbone.View.extend({
    url: 'settings',

    events: {
        'click .tabs > li': 'loadSection'
    },

    destructor: function () {

    },

    postRender: function () {
        this.loadView('guia');
    },

    loadSection: function (el) {
        if ($(el.currentTarget).hasClass('active')) {
            return;
        }

        $('.tabs').find('li.active').removeClass('active');
        $(el.currentTarget).addClass('active');

        this.loadView($(el.currentTarget).find('a').attr('section'));
    },

    loadView: function (section) {
        Application.loadingOverlay('show');

        Application.loadSubView('Settings/' + section, function (req, original) {
            Application.currentSubView.renderTemplate();
        });
    }
});