var MeSettingsVdrView = Backbone.View.extend({
    template: 'MeSettingsVdrTemplate',
    className: 'span9 columns',

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        $('#vdrIP', this.el).val(GUIA.guia.vdrHost);
        $('#restfulPort', this.el).val(GUIA.guia.restfulPort);
    },

    events: {
        'click button[action*="update"]': 'updateConnection'
    },

    updateConnection: function () {
        GUIA.guia.vdrHost = $('#vdrIP', this.el).val();
        GUIA.guia.restfulPort = $('#restfulPort', this.el).val();

        socket.emit('Configuration:create', {
            key: 'vdrHost',
            value: GUIA.guia.vdrHost
        }, function (res) {
        });

        socket.emit('Configuration:create', {
            key: 'restfulPort',
            value: GUIA.guia.restfulPort
        }, function (res) {
        });
    },

    render: function () {
        return this;
    }
});

