var SettingsGuiaView = Backbone.View.extend({
    template: 'SettingsGuiaTemplate',
    className: 'span16 columns',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        if (GUIA.guia.epgscandelay === undefined) {
            $('#epgscandelay option[value="1"]', this.el).attr('selected', true);
        } else {
            $('#epgscandelay option[value="' + GUIA.guia.epgscandelay + '"]', this.el).attr('selected',true);
        }

        if (GUIA.guia.fetchTmdbActors === undefined) {
            $('#fetchTmdbActors', this.el).attr('checked', false);
        } else {
            $('#fetchTmdbActors', this.el).attr('checked', GUIA.guia.fetchTmdbActors);
        }

        if (GUIA.guia.fetchTmdbMovies === undefined) {
            $('#fetchTmdbMovies', this.el).attr('checked', false);
        } else {
            $('#fetchTmdbMovies', this.el).attr('checked', GUIA.guia.fetchTmdbMovies);
        }

        if (GUIA.guia.fetchThetvdbSeasons === undefined) {
            $('#fetchThetvdbSeasons', this.el).attr('checked', false);
        } else {
            $('#fetchThetvdbSeasons', this.el).attr('checked', GUIA.guia.fetchThetvdbSeasons);
        }
    },

    events: {
        'change #epgscandelay': 'setEpgScandelay',
        'change #fetchTmdbActors': 'setFetchTmdbActors',
        'change #fetchTmdbMovies': 'setFetchTmdbMovies',
        'change #fetchThetvdbSeasons': 'setFetchThetvdbSeasons'
    },

    setEpgScandelay: function (ev) {
        this.updateConfiguration({
            key: 'epgscandelay',
            value: $('option:selected', $(ev.currentTarget)).val()
        });
    },

    setFetchTmdbActors: function (ev) {
        this.updateConfiguration({
            key: 'fetchTmdbActors',
            value: $(ev.currentTarget).is(':checked')
        });
    },

    setFetchTmdbMovies: function (ev) {
        this.updateConfiguration({
            key: 'fetchTmdbMovies',
            value: $(ev.currentTarget).is(':checked')
        });
    },

    setFetchThetvdbSeasons: function (ev) {
        this.updateConfiguration({
            key: 'fetchThetvdbSeasons',
            value: $(ev.currentTarget).is(':checked')
        });
    },

    updateConfiguration: function (value) {
        socket.emit('Configuration:create', value, function (data) {
            GUIA.guia[value.key] = value.value;
        });
    },

    render: function () {
        return this;
    }
});

