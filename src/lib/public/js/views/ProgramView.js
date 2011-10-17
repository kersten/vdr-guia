var ProgramView = Backbone.View.extend({
    url: "program",
    
    events: {
        'click #channellist > table > tbody > tr': "loadEvents"
    },
    
    generateHTML: function (callback) {
        var self = this;
        if (typeof(Application.collections.channellist) == 'undefined') {
            var ChannelCollection = require('./ChannelCollection');
            Application.collections.channellist = new ChannelCollection();
            
            Application.collections.channellist.fetch({success: function (collection) {
                callback.apply(this, [_.template(self.template, {channels: collection})]);
            }});
        } else {
            callback.apply(this, [_.template(self.template, {channels: Application.collections.channellist})]);
        }
    },
    
    postRender: function () {
        var diff = $('#content').height() - $('#channellist').parent().height() - $('#header_div').height();
        
        $('#channellist').parent().css('height', $(window).height() - $('#channellist').parent().offset().top - diff).data({
            height: $(window).height() - $('#channellist').offset().top,
            top: $('#channellist').offset().top
        });
        
        $('#channellist').css('height', '100%');
    },
    
    loadEvents: function (event) {
        Application.loadView('/Event', function (req, original) {
            Application.views[req].renderTemplate($(event.currentTarget).attr('channelid'), 1);
        });
    }
});