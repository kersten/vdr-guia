var ProgramView = Backbone.View.extend({
    url: "program",
    page: 1,
    items: null,
    update: false,

    events: {
        'click .media-grid > li': 'loadEvents'
    },

    addChannel: function (item) {
        if (item.has('name')) {
            var channel = $('<li></li>');

            channel.attr({
                channel_id: item.get('_id'),
                channel_name: item.get('name'),
                hasimage: item.get('image')
            });

            channel.css({
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
            });

            var link = $('<a></a>').append($('<img></img>').attr({
                src: '/logo/' + item.get('name'),
                title: item.get('name')
            }).css({
                width: 240,
                height: 134,
            }).addClass('thumbnail'));

            channel.append(link);

            $('.media-grid').append(channel);
        }
    },

    generateHTML: function (callback) {
        var self = this;

        callback.apply(this, [_.template(self.template)]);

        var maxHeight = $(window).height() - $('#content').outerHeight() - $('.topbar').outerHeight();

        $('#channellist').parent().css({maxHeight: maxHeight, height: maxHeight});
        $('#channellist').css({
            height: maxHeight,
            maxHeight: maxHeight,
            position: 'absolute',
            overflow: 'hidden',
            top:0,
            right: 0
        });

        this.channellist = new ChannelCollection();

        this.items = Math.ceil(maxHeight / 95) * 3 * 2;

        this.page = 1;

        this.channellist.fetch({
            data: {
                page: this.page,
                limit: this.items
            }, success: function (collection) {
                collection.forEach(function (chan) {
                    self.addChannel(chan);
                });

                self.page++;

                $('#channellist').lionbars({
                    reachedBottom: function () {
                        Application.loadingOverlay('show');

                        self.channellist.fetch({data: {page: self.page, limit: self.items}, success: function (collection) {
                            if (collection.length == 0) {
                                return;
                            }

                            collection.forEach(function (chan) {
                                self.addChannel(chan);
                            });

                            Application.loadingOverlay('hide');
                        }});

                        self.page++;
                    }
                });

                Application.loadingOverlay('hide');
            }
        });
    },

    render: function () {
        var self = this;

        if (this.template == null) {
            return this;
        }

        this.generateHTML(function (res) {
            self.el.html(res);
            $(document).attr('title', $('#header_div').attr('title'));

            if (typeof(self.postRender) == 'function') {
                self.postRender();
            }
        });

        return this;
    },

    loadEvents: function (event) {
        Application.loadingOverlay('show');

        Application.loadSubView('Program/Event', function (req, original) {
            Application.currentSubView.renderTemplate($(event.currentTarget).attr('channel_id'), 1);

            var oldImg = $('#header_div > img');

            var img = $('<img></img>').attr('src', '/logo/' + $(event.currentTarget).attr('channel_name')).css({
                display: 'none',
                height: 65,
                position: 'absolute',
                right: 20,
                top: 5
            }).attr('title', $(event.currentTarget).attr('channel_name')).appendTo('#header_div');

            img.load(function () {
                img.fadeIn('normal', function () {
                    if (oldImg != null) {
                        oldImg.remove();
                    }
                });
            });
        });
    }
});