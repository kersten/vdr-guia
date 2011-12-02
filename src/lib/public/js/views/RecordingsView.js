var RecordingsView = Backbone.View.extend({
    url: "recordings",
    
    events: {
        'click tr[isFile="true"]': "showEvent"
    },
    
    showEvent: function (event) {
        console.log($(event.currentTarget));
        socket.emit('Recording:readOne', {
            number: $(event.currentTarget).attr('number')
        }, function (data) {
            $('#recording_details > .modal-header > h3').text(data.event_title);
            $('#recording_details > .modal-body > p').text(data.event_description);
            $('#recording_details').modal({backdrop: true, keyboard: true, show: true});
            
            $('#recording_details > .modal-footer > button:first-child').click(function () {
                $('#recording_details').modal('hide');
            });
            
            $('#recording_details > .modal-footer > button:nth-child(2)').click(function () {
                $(this).button('loading');
                alert('Delete This Recording');
                $('#recording_details').modal('hide');
            });
        });
    },
    
    generateHTML: function (callback) {
        var self = this;
        this.recordings = new RecordingCollection();

        this.recordings.fetch({success: function (collection) {
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