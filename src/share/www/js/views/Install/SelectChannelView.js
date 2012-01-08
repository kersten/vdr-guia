var InstallSelectChannelView = Backbone.View.extend({
    template: 'InstallSelectChannelsTemplate',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        this.channellist = new ChannelCollection();

        var self = this;
        this.channellist.fetch({
            success: function (collection) {
                collection.forEach(function (channel) {
                    var row = $('<tr></tr>').attr('_id', channel.get('_id'));
                    row.append($('<td></td>').html(channel.get('number')));

                    var active = $('<input></input>').attr('type', 'checkbox');

                    active.bind('change', function () {
                        if ($(this).is(':checked')) {
                            channel.set({active: true});
                        } else {
                            channel.set({active: false});
                        }

                        channel.save(function (doc) {
                            console.log(doc);
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
        var view = new InstallStepThreeView({
            model: this.model
        });

        $('#body').html(view.render().el);

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

