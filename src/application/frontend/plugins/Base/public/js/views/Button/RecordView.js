var ButtonRecordView = Backbone.View.extend({
    tagName: 'img',

    events: {
        'hover': 'switchImg',
        'click': 'record'
    },

    initialize: function () {
        this.model.on('change:timer_exists', this.initialize, this );

        var image = 'Circle';

        if (this.model.get('type') == 'series') {
            image += 'Series';
        }

        if (this.model.get('timer_exists')) {
            image += '-2';
        }

        $(this.el).css({
            cursor: 'pointer',
            verticalAlign: 'sub'
        }).attr({
                src: '/icons/devine/black/16x16/' + image + '.png',
                title: !this.model.get('timer_exists') ? 'Record' : 'Delete timer'
            });

        if (parseInt(this.model.get('stop')) < parseInt(new Date().getTime() / 1000)) {
            $(this.el).css({opacity: .5, filter: 'alpha(opacity=50)', cursor: 'auto'});
        }
    },

    switchImg: function (ev) {
        if (parseInt(this.model.get('stop')) < parseInt(new Date().getTime() / 1000)) {
            return;
        }

        var image = 'Circle';

        if (this.model.get('type') == 'series') {
            image += 'Series';
        }

        var image_record = image;

        if (this.model.get('timer_exists')) {
            image += '-2';
            image_record += '';
        } else {
            image += '';
            image_record += '-2';
        }

        switch (ev.type) {
            case 'mouseenter':
                $(ev.currentTarget).attr({
                    src: '/icons/devine/black/16x16/' + image_record + '.png',
                    title: !this.model.get('timer_exists') ? 'Record' : 'Delete timer'
                });
                break;

            case 'mouseleave':
                $(ev.currentTarget).attr({
                    src: '/icons/devine/black/16x16/' + image + '.png',
                    title: !this.model.get('timer_exists') ? 'Record' : 'Delete timer'
                });
                break;
        };
    },

    record: function () {
        if (parseInt(this.model.get('stop')) < parseInt(new Date().getTime() / 1000)) {
            return;
        }

        if (this.model.get('timer_exists')) {
            this.model.set({timer_exists: false});

            this.model.save();
        } else {
            this.model.set({timer_exists: true});

            this.model.save();
        }
    },

    render: function () {
        return this;
    }
});