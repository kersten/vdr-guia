var InstallSelectChannelView = Backbone.View.extend({
    template: 'InstallSelectChannelsTemplate',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        $('#next', this.el).button('loading');

        this.channellist = new ChannelCollection();

        var spinner = $('<div></div>').css({
            position: 'fixed',
            top: '0px',
            width: $(window).width(),
            height: $(window).height(),
            zIndex: 10000,
            opacity: 1
        }).addClass('loadingoverlay').appendTo('body').spin({
            lines: 12, // The number of lines to draw
            length: 10, // The length of each line
            width: 5, // The line thickness
            radius: 22, // The radius of the inner circle
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 58, // Afterglow percentage
            shadow: false // Whether to render a shadow
        });

        var self = this;
        this.channellist.fetch({
            data: {
                install: true,
                restful: 'http://' + this.model.get('vdrhost') + ':' + this.model.get('restfulport')
            },
            success: function (collection) {
                spinner.spin(false);
                spinner.remove();

                $('#channels > tbody', self.el).children().remove();
                
                collection.forEach(function (channel) {
                    $('#next', self.el).button('reset');
                    $('#next', self.el).removeClass('disabled');
                    $('#previous', self.el).removeClass('disabled');

                    var row = $('<tr></tr>').attr('_id', channel.get('_id'));
                    row.append($('<td></td>').html(channel.get('number')));

                    var active = $('<input></input>').attr('type', 'checkbox').addClass('channels');

                    active.bind('change', function () {
                        if ($(this).is(':checked')) {
                            channel.set({active: true});
                        } else {
                            channel.set({active: false});
                        }

                        channel.save(function (doc) {
                        });
                    });

                    if (channel.get('active') == true) {
                        active.attr('checked', 'checked');
                    }

                    row.append($('<td></td>').html(active));
                    row.append($('<td></td>').html(channel.get('name')));

                    $('#channels > tbody', self.el).append(row);
                });
            }
        });
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function () {
        var channelsSelected = false;

        $('input.channels[type=checkbox]', this.el).each(function () {
            if ($(this).is(':checked')) {
                channelsSelected = true;
            }
        });

        if (channelsSelected) {
            var view = new InstallStepThreeView({
                model: this.model
            });

            $('#body').html(view.render().el);
        } else {
            // alert
        }

        return;
    },

    loadPreviousSite: function () {
        var view = new InstallStepTwoView({
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        return this;
    }
});

