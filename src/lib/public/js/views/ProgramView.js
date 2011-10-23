var ProgramView = Backbone.View.extend({
    url: "program",
    
    events: {
        'click .media-grid > li': 'loadEvents',
        'scroll #channellist': 'preload'
    },
    
    preload: function (event, data) {
        console.log(data);
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
            overflow: 'hidden',
            top:0
        });
        
        var ChannelCollection = require('./ChannelCollection');
        var channellist = new ChannelCollection();

        channellist.fetch({
            data: {
                page: 1,
                limit: Math.ceil(maxHeight / 73) * 7 * 2
            }, success: function (collection) {
                collection.forEach(function (chan) {
                    if (chan.has('name')) {
                        var channel = $('<li></li>');

                        channel.attr({
                            channel_id: chan.get('channel_id'),
                            channel_name: chan.get('name'),
                            hasimage: chan.get('image')
                        });

                        channel.css('cursor', 'pointer');

                        var link = $('<a></a>').append($('<img></img>').attr({
                            src: '/logo/' + chan.get('name'),
                            title: chan.get('name')
                        }).css({
                            width: 90,
                            height: 51
                        }).addClass('thumbnail'));

                        channel.append(link);

                        $('.media-grid').append(channel);
                    }
                });
                
                $('#channellist').lionbars();
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