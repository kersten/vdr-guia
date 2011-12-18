var SettingsChannelsView = Backbone.View.extend({
    url: "settings/channels",

    initialize: function () {

    },

    destructor: function () {
        
    },

    generateHTML: function (callback) {
        var self = this;

        callback.apply(this, [_.template(self.template)]);

        this.channellist = new ChannelCollection();

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

                    $('#channels > tbody').append(row);
                });

                Application.loadingOverlay('hide');
            }
        });
    },

    render: function () {
        this.generateHTML(function (res) {
            $('#settingssection').children().remove();
            $('#settingssection').html(res);
        });
    },

    renderTemplate: function () {
        var self = this;

        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    self.template = res;
                    self.render();
                }
            });
        } else {
            this.render();
        }
    }
});

