var SettingsDatabaseView = Backbone.View.extend({
    url: "settings/database",

    initialize: function () {

    },

    destructor: function () {
        $(this.el).undelegate('button[action*="reset"]', 'click');
    },
    
    events: {
        'click button[action*="reset"]': 'resetDatabase'
    },
    
    resetDatabase: function () {
        $('#resetDatabaseDialog > .modal-footer > button').click(function () {
            if ($(this).attr('action') == 'closeDialog') {
                $('#resetDatabaseDialog').modal('hide');
            }
            
            if ($(this).attr('action') == 'confirmDialog') {
                
            }
        });
        
        $('#resetDatabaseDialog').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    },

    updateConfiguration: function (value) {
        socket.emit('Configuration:create', value, function (data) {
            Application.guia[value.key] = value.value;
        });
    },

    render: function () {
        var self = this;

        this.generateHTML(function (res) {
            $('#settingssection').children().remove();
            $('#settingssection').html(res);
            
            socket.emit('DatabaseStatistics:fetch', {}, function (data) {
                Application.guia[value.key] = value.value;
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