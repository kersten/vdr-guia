var SettingsGuiaView = Backbone.View.extend({
    url: "settings/guia",

    initialize: function () {

    },

    destructor: function () {

    },

    render: function () {
        this.generateHTML(function (res) {
            $('#settingssection').children().remove();
            $('#settingssection').html(res);

            $('#epgsyncdelay').change(function () {
                socket.emit('Configuration:create', {
                    syncdelay: $('#epgsyncdelay option:selected').val()
                }, function (data) {
                    console.log(data);
                });

                console.log('Update sync time to: ' + $('#epgsyncdelay option:selected').val());
            });

            Application.loadingOverlay('hide');
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

