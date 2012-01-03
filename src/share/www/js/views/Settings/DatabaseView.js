var SettingsDatabaseView = Backbone.View.extend({
    url: "settings/database",

    initialize: function () {

    },

    destructor: function () {
        $(this.el).undelegate('button[action*="resetDatabase"]', 'click');
        $(this.el).undelegate('button[action*="resetEvents"]', 'click');
        $(this.el).undelegate('button[action*="refreshStats"]', 'click');
    },
    
    events: {
        'click button[action*="resetDatabase"]': 'resetDatabase',
        'click button[action*="resetEvents"]': 'resetEvents',
        'click button[action*="refreshStats"]': 'updateStats'
    },
    
    resetDatabase: function () {
        var self = this;
        
        $('#resetDatabaseDialog > .modal-footer > button').click(function () {
            if ($(this).attr('action') == 'closeDialog') {
                $('#resetDatabaseDialog').modal('hide');
            }
            
            if ($(this).attr('action') == 'confirmDialog') {
                socket.emit('Database:reset', {database: true}, function (data) {
                    self.updateStats();
                    $('#resetDatabaseDialog').modal('hide');
                });
            }
        });
        
        $('#resetDatabaseDialog').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    },
    
    resetEvents: function () {
        var self = this;
        
        $('#resetEventsDialog > .modal-footer > button').click(function () {
            if ($(this).attr('action') == 'closeDialog') {
                $('#resetEventsDialog').modal('hide');
            }
            
            if ($(this).attr('action') == 'confirmDialog') {
                socket.emit('Database:reset', {events: true}, function (data) {
                    self.updateStats();
                    $('#resetEventsDialog').modal('hide');
                });
            }
        });
        
        $('#resetEventsDialog').modal({
            show: true,
            keyboard: true,
            backdrop: true
        });
    },

    updateStats: function () {
        socket.emit('DatabaseStatistics:fetch', {}, function (data) {
            data = data.data;
            $('#sizeOfDatabase').text((data.dbstats.dataSize / 1024 / 1024).toFixed(2) + ' MB');
            
            $('#channelCount').text(data.channelStats.count);
            $('#eventCount').text(data.eventStats.count);
            $('#actorCount').text(data.actorStats.count);
            $('#actorDetailCount').text(data.actorDetailStats.count);
            $('#movieDetailCount').text(data.movieDetailStats.count);
        });
    },

    render: function () {
        var self = this;

        this.generateHTML(function (res) {
            $('#settingssection').children().remove();
            $('#settingssection').html(res);
            
            self.updateStats();

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