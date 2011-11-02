var ProgramView = Backbone.View.extend({
    url: "program",
    page: 1,
    items: null,
    update: false,
    
    events: {
        'click .media-grid > li': 'loadEvents',
        'scroll #channellist': 'preload'
    },
    
    addChannel: function (item) {
        if (item.has('name')) {
            var channel = $('<li></li>');

            channel.attr({
                channel_id: item.get('channel_id'),
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
                width: 90,
                height: 51
            }).addClass('thumbnail'));

            channel.append(link);

            $('.media-grid').append(channel);
        }
    },
    
    preload: function (event, data) {
        var self = this;
        
        console.log(((($('#channellist').height() - 2)) - 400) + ' < ' + data.scrollPosition);
        console.log(data);
        
        if ((($('#channellist').height() - 2) - 400) < data.offsetV) {
            if (!this.update) {
                this.update = true;
                this.page += 1;

                var self = this;

                this.channellist.fetch({
                    data: {
                        page: this.page,
                        limit: this.items
                    },
                    success: function (collection) {
                        collection.forEach(function (chan) {
                            self.addChannel(chan);
                        });

                        //$('#channellist').bind('scroll', self.preload);
                        self.update = false;
                    }
                });
            }
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
            postion: 'absolute',
            overflow: 'auto',
            top:0
        });
        
        this.channellist = new ChannelCollection();
        
        this.items = Math.ceil(maxHeight / 73) * 7 * 2;

        this.channellist.fetch({
            data: {
                page: this.page,
                limit: this.items
            }, success: function (collection) {
                collection.forEach(function (chan) {
                    self.addChannel(chan);
                });
                
                //$('#channellist').lionbars();
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
        
        Application.loadSubView('/Event', function (req, original) {
            Application.views[req].renderTemplate($(event.currentTarget).attr('channel_id'), 1);
            
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