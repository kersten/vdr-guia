var ProgramView = Backbone.View.extend({
    url: "program",
    
    events: {
        'click #channellist > div > table > tbody > tr': "loadEvents"
    },
    
    generateHTML: function (callback) {
        var self = this;
        if (typeof(Application.collections.channellist) == 'undefined') {
            var ChannelCollection = require('./ChannelCollection');
            Application.collections.channellist = new ChannelCollection();
            
            Application.collections.channellist.fetch({success: function (collection) {
                callback.apply(this, [_.template(self.template, {channels: collection})]);
                Application.loadingOverlay('hide');
            }});
        } else {
            callback.apply(this, [_.template(self.template, {channels: Application.collections.channellist})]);
            Application.loadingOverlay('hide');
        }
    },
    
    postRender: function () {
        var maxHeight = $(window).height() - ($('body').height() - $('#channellist').height()) - 40;
        
        $('#channellist').parent().css('max-height', maxHeight);
        $('#channellist').css({
            height: maxHeight,
            maxHeight: maxHeight,
            postion: 'relative',
            overflow: 'hidden'
        });
        
         $('#channellist').lionbars();
    },
    
    loadEvents: function (event) {
        Application.loadingOverlay('show');
        
        Application.loadSubView('/Event', function (req, original) {
            Application.views[req].renderTemplate($(event.currentTarget).attr('channelid'), 1);
            
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