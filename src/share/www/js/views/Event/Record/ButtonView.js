var EventRecordButtonView = Backbone.View.extend({
    tagName: 'img',
    
    events: {
        'hover': 'switchImg',
        'click': 'record'
    },
    
    initialize: function () {
        var image = 'Circle';

        if (this.model.get('type') == 'series') {
            image += 'Series'
        }

        if (this.model.get('timer_active')) {
            image += '-2';
        }
        
        $(this.el).css({
            cursor: 'pointer',
            verticalAlign: 'sub'
        }).attr({
            src: '/icons/devine/black/16x16/' + image + '.png',
            title: !this.model.get('timer_active') ? 'Record' : 'Delete timer'
        });
    },
    
    switchImg: function (ev) {
        console.log('test');
        
        var image = '';
        var image_record = '-2';

        if (this.model.get('timer_active')) {
            image = '-2';
            image_record = '';
        }

        switch (ev.type) {
            case 'mouseenter':
                $(ev.currentTarget).attr({
                    src: '/icons/devine/black/16x16/Circle' + image_record + '.png',
                    title: !this.model.get('timer_active') ? 'Record' : 'Delete timer'
                });
                break;

            case 'mouseleave':
                $(ev.currentTarget).attr({
                    src: '/icons/devine/black/16x16/Circle' + image + '.png',
                    title: !this.model.get('timer_active') ? 'Record' : 'Delete timer'
                });
                break;
        };
    },
    
    record: function () {
        if (this.model.get('timer_active')) {
            console.log('Delete timer for: ' + this.model.get('_id'));
            this.model.set({timer_active: false});
            
            this.model.save();
        } else {
            console.log('Create timer for: ' + this.model.get('_id'));
            this.model.set({timer_active: true});
            
            this.model.save();
        }
    },
    
    render: function () {
        return this;
    }
});