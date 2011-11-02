var RecordingsView = Backbone.View.extend({
    url: "recordings",
    
    generateHTML: function (callback) {
        var self = this;
        if (typeof(Application.collections.recordings) == 'undefined') {
            Application.collections.recordings = new RecordingCollection();
            
            Application.collections.recordings.fetch({success: function (collection) {
                callback.apply(this, [_.template(self.template, {recordings: collection})]);
            }});
        } else {
            callback.apply(this, [_.template(self.template, {recordings: Application.collections.recordings})]);
        }
    },
    
    postRender: function () {
        var diff = $('#content').height() - $('#recordingslist').parent().height() - $('#header_div').height();
        
        $('#recordingslist').parent().css('height', $(window).height() - $('#recordingslist').parent().offset().top - diff).data({
            height: $(window).height() - $('#recordingslist').offset().top,
            top: $('#recordingslist').offset().top
        });
        
        $('#recordingslist').css('height', '100%');
    }
});