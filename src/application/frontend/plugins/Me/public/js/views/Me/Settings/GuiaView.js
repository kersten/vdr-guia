var MeSettingsGuiaView = Backbone.View.extend({
    template: 'MeSettingsGuiaTemplate',
    className: 'span9 columns',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        //if (GUIA.guia.epgscandelay === undefined) {
            $('#epgscandelay option[value="1"]', this.el).attr('selected', true);
        //} else {
        //    $('#epgscandelay option[value="' + GUIA.guia.epgscandelay + '"]', this.el).attr('selected',true);
        //}
    },

    events: {
        'change #epgscandelay': 'setEpgScandelay',
    },

    setEpgScandelay: function (ev) {
        this.updateConfiguration({
            key: 'epgscandelay',
            value: $('option:selected', $(ev.currentTarget)).val()
        });
    },

    updateConfiguration: function (value) {
        socket.emit('Configuration:create', value, function (data) {
            //GUIA.guia[value.key] = value.value;
        });
    },

    render: function () {
        return this;
    }
});

