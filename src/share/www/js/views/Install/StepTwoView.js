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
            console.log(data);
            if (data.reachable) {
                var password = hex_sha512(self.model.get('password'));
                self.model.set({password: password});

                self.model.save();

                $('#next', self.el).button('reset');

                var view = new InstallSelectChannelView({
                    model: self.model
                });

                $('#body').html(view.render().el);
            } else {
                $('#next', self.el).button('reset');

                $.ajax({
                    url: "/templates/install/dialogs/restfulCheck",
                    success: function (res) {
                        var template = _.template(res, {});
                        $('body').append(template);

                        $('#restfulCheck').modal('show');
                    }
                });
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