var SettingsView = Backbone.View.extend({
    template: 'SettingsTemplate',
    
    events: {
        'click .tabs > li': 'switchSection'
    },
    
    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        
        if (this.options.section === undefined) {
            this.options.section = 'Guia';
        }
        
        $('.tabs > li[data-section="' + this.options.section + '"]', this.el).addClass('active');
        
        this.loadSection();
    },

    render: function () {
        return this;
    },
    
    switchSection: function (ev) {
        if ($(ev.currentTarget).hasClass('active')) {
            return;
        }

        $('.tabs').find('li.active').removeClass('active');
        $(ev.currentTarget).addClass('active');
        
        this.options.section = $(ev.currentTarget).data('section');
        
        this.loadSection();
    },

    loadSection: function () {
        if (this.subView != null) {
            this.subView.remove();
        }
        
        this.subView = new window['Settings' + this.options.section + 'View']({});
        $('#settingssection', this.el).html(this.subView.render().el);
        
        GUIA.router.navigate('!/Settings/' + this.options.section);
    },

    loadView: function (section) {
        Application.loadingOverlay('show');

        Application.loadSubView('Settings/' + section, function (req, original) {
            Application.currentSubView.renderTemplate();
        });
    }
});