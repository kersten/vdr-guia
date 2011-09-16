jQuery.extend($.vdrmanager, {
    recording: {
        list: function (site, cb) {
            var getRecordingsNext = function (recordings) {
                if (recordings.recordings.length == 0) {
                    $(document).unbind('scroll resize');
                }

                socket.removeListener('getRecordings', getRecordingsNext);
                
                cb.apply(this, arguments);
            };

            socket.on('getRecordings', getRecordingsNext);

            socket.emit('getRecordings', {
                site: site
            });
        },
        remove: function (number, cb) {
            var deleteCb = function () {
                cb.call();

                socket.removeListener('recordingDeleted', deleteCb);
            };

            socket.on('recordingDeleted', deleteCb);

            socket.emit('deleteRecording', {number: parseInt(number)});
        }
    }
});