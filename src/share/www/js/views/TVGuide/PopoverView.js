var TVGuidePopoverView = Backbone.View.extend({
    template: 'TVGuidePopoverTemplate',
    
    initialize: function () {
        var self = this;
        var template = _.template( $('#' + this.template).html(), {event: this.model} );
        
        $(this.el).popover({
            title: function () {
                return self.model.get('title');
            },
            content: function () {
                return template;
            },
            trigger: 'manual',
            placement: 'above',
            html: true
        });
        
        console.log(this.model);
    },
    
    show: function () {
        $(this.el).popover('show');
    },
    
    hide: function () {
        var self = this;
        
        this.timerId = setTimeout(function () {
            $(self.el).popover('hide');
        }, 100);
    },
    
    render: function () {
        return this;
    }
});