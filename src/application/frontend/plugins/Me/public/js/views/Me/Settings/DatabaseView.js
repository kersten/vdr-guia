var MeSettingsDatabaseView = Backbone.View.extend({
    template: 'MeSettingsDatabaseTemplate',
    className: 'span9 columns',

    events: {
        'click button[action*="resetDatabase"]': 'resetDatabase',
        'click button[action*="resetEvents"]': 'resetEvents',
        'click button[action*="refreshStats"]': 'updateStats'
    },

    initialize: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));
        this.updateStats();
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
        var self = this;

        socket.emit('DatabaseStatistics:fetch', {}, function (data) {
            data = data.data;
            $('#sizeOfDatabase', self.el).text((data.dbstats.dataSize / 1024 / 1024).toFixed(2) + ' MB');

            $('#channelCount', self.el).text(data.channelStats.count);
            $('#eventCount', self.el).text(data.eventStats.count);
            $('#actorCount', self.el).text(data.actorStats.count);
            $('#actorDetailCount', self.el).text(data.actorDetailStats.count);
            $('#movieDetailCount', self.el).text(data.movieDetailStats.count);
        });
    },

    render: function () {
        return this;
    }
});