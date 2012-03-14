var InstallStepTwoView = Backbone.View.extend({
    initialize: function () {
        $(document).attr('title', 'GUIA // Installation // Step 2');
    },

    events: {
        'click #next': 'loadNextSite',
        'click #previous': 'loadPreviousSite'
    },

    loadNextSite: function () {
        $('#next', this.el).button('loading');

        var self = this;

        this.model.set({vdrhost: $('#VDRHost').val()});
        this.model.set({restfulport: $('#restfulPort').val()});

        socket.emit('Install:checkrestful', {
            vdrhost: $('#VDRHost').val(),
            restfulport: $('#restfulPort').val()
        }, function (data) {
            if (data.reachable) {
                self.model.save();

                $('#VDRHost').parent().parent().removeClass('error');
                $('#VDRHost').removeClass('error');
                $('#VDRHost').parent().children('span').remove();

                $('#restfulPort').parent().parent().removeClass('error');
                $('#restfulPort').removeClass('error');

                $('#next', self.el).button('reset');

                var view = new InstallSelectChannelView({
                    model: self.model
                });

                $('#body').html(view.render().el);
            } else {
                $('#next', self.el).button('reset');

                $('#VDRHost').parent().parent().addClass('error');
                $('#VDRHost').addClass('error');

                $('#restfulPort').parent().parent().addClass('error');
                $('#restfulPort').addClass('error');

                $('#VDRHost').parent().append($('<span></span>').addClass('help-inline').html('Host or port is not reachable, please check!'));
            }
        });
    },

    loadPreviousSite: function () {
        var view = new InstallStepOneView({
            model: this.model
        });

        $('#body').html(view.render().el);

        return;
    },

    render: function () {
        var template = _.template($('#InstallStepTwoTemplate').html(), {});
        $(this.el).html(template);

        return this;
    }
});