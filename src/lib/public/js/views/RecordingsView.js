var RecordingsView = Backbone.View.extend({
    url: "recordings",
    
    events: {
        'click tr[isRecording="true"]': "showEvent"
    },
    
    showEvent: function () {
        console.log('Show info for recording');
    },
    
    generateHTML: function (callback) {
        var self = this;
        this.recordings = new RecordingCollection();

        this.recordings.fetch({success: function (collection) {
                console.log(collection)
            callback.apply(this, [_.template(self.template, {recordings: collection})]);
        }});
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