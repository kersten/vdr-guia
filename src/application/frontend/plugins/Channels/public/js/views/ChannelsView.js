var ChannelsView = Backbone.View.extend({
    template: 'ChannelsTemplate',

    events: {
        'click .dropdown-menu > li > a': 'changeChannel'
    },

    initialize: function () {
        var self = this;

        this.collection = new ChannelCollection();

        this.collection.fetch({
            data: {
                active: true
            }, success: function (collection) {
                if (self.options.channel !== undefined) {
                    self.model = collection.get(self.options.channel);
                } else {
                    self.model = collection.models[0];
                }

                var template = _.template( $('#' + self.template).html(), {channels: collection, model: self.model} );
                $(self.el).html( template );

                var top = $('.page-header').offset().top - 40 -18;
                var floating = false;

                $(window).unbind('scroll');
                $(window).scroll(function (event) {
                    var y = $(this).scrollTop();

                    if (y >= top) {
                        if (!floating) {
                            floating = true;
                            $('.page-header', self.el).clone().attr('id', 'page-header_tmp').insertBefore($('.page-header', self.el));

                            $('#page-header_tmp').css({
                                position: 'fixed',
                                top: 40,
                                margin: 0,
                                padding: '18px 0',
                                width: $('.page-header', self.el).width(),
                                zIndex: 999,
                                background: '#FFF'
                            });
                        }
                    } else {
                        floating = false;
                        $('.page-header', self.el).css({
                            position: 'relative',
                            top: 0,
                            zIndex: '0'
                        });

                        $('#page-header_tmp').remove();
                    }
                });

                self.getEpg();
            }
        });
    },

    changeChannel: function (ev) {
        ev.preventDefault();

        if (this.model !== undefined && this.model.get('_id') == $(ev.currentTarget).data('_id')) {
            return;
        }

        this.model = this.collection.get($(ev.currentTarget).data('_id'));

        $('.dropdown-toggle', this.el).html('<img src="/logo/' + this.model.get('name') + '" style="height: 10px;" /> ' + this.model.get('name') + '<span class="caret"></span>');
        $('.page-header > h1 > small').html(this.model.get('name'));

        Backbone.history.navigate($(ev.currentTarget).attr('href'));

        this.getEpg();
    },

    getEpg: function () {
        if (this.epgView !== undefined) {
            this.epgView.remove();
        }

        this.epgView = new ChannelsEpgView({
            model: this.model
        });

        $('.row', this.el).html(this.epgView.render().el);
    },

    render: function () {
        return this;
    }
});