var RecordingsView = Backbone.View.extend({
    template: "RecordingsTemplate",
    
    events: {
        'click .tabs > li': 'switchSection',
        'shown a[data-toggle="tab"]': 'switchSection'
    },
    
    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        
        if (this.options.section === undefined) {
            this.options.section = 'Recordings';
        }
        
        this.loadSection();
    },

    render: function () {
        return this;
    },
    
    switchSection: function (e) {
        this.options.section = $(e.target).data('view');

        $('#' + $(e.target).data('view')).addClass('active');
        $('#' + $(e.relatedTarget).data('view')).removeClass('active');
        
        this.loadSection();
    },

    loadSection: function (e) {
        if (this.subView != null) {
            this.subView.remove();
        }
        
        this.subView = new window['Recordings' + this.options.section + 'View']({});
        $('#' + this.options.section, this.el).html(this.subView.render().el);
        
        Backbone.history.navigate('!/Recordings/' + this.options.section);
    }
});