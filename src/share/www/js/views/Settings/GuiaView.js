var SettingsGuiaView = Backbone.View.extend({
    template: 'SettingsGuiaTemplate',
    className: 'span14 columns',

    updateConfiguration: function (value) {
        socket.emit('Configuration:create', value, function (data) {
            Application.guia[value.key] = value.value;
        });
    },

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        
        return this;
        
        var self = this;

        this.generateHTML(function (res) {
            $('#settingssection').children().remove();
            $('#settingssection').html(res);

            $('#epgscandelay').change(function () {
                self.updateConfiguration({
                    key: 'epgscandelay',
                    value: $('#epgscandelay option:selected').val()
                });
            });

            $('#fetchTmdbActors').change(function () {
                self.updateConfiguration({
                    key: 'fetchTmdbActors',
                    value: $('#fetchTmdbActors').is(':checked')
                });
            });

            $('#fetchTmdbMovies').change(function () {
                self.updateConfiguration({
                    key: 'fetchTmdbMovies',
                    value: $('#fetchTmdbMovies').is(':checked')
                });
            });

            $('#fetchThetvdbSeasons').change(function () {
                self.updateConfiguration({
                    key: 'fetchThetvdbSeasons',
                    value: $('#fetchThetvdbSeasons').is(':checked')
                });
            });

            if (Application.guia.epgscandelay === undefined) {
                $('#epgscandelay option[value="1"]').attr('selected', true);
            } else {
                $('#epgscandelay option[value="' + Application.guia.epgscandelay + '"]').attr('selected',true);
            }

            if (Application.guia.fetchTmdbActors === undefined) {
                $('#fetchTmdbActors').attr('checked', false);
            } else {
                $('#fetchTmdbActors').attr('checked', Application.guia.fetchTmdbActors);
            }

            if (Application.guia.fetchTmdbMovies === undefined) {
                $('#fetchTmdbMovies').attr('checked', false);
            } else {
                $('#fetchTmdbMovies').attr('checked', Application.guia.fetchTmdbMovies);
            }

            if (Application.guia.fetchThetvdbSeasons === undefined) {
                $('#fetchThetvdbSeasons').attr('checked', false);
            } else {
                $('#fetchThetvdbSeasons').attr('checked', Application.guia.fetchThetvdbSeasons);
            }

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

