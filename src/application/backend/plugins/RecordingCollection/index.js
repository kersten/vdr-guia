var rest = require('restler');

var RecordingCollection = {
    listener: {
        "read": function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            /*rest.get(vdr.restful + '/recordings.json').on('success',  function (recordings) {
                recordings = recordings.recordings;
                var records = new Array();
                var directories = new Array();

                /*recordings.forEach(function (data) {
                 if (data.name.match(/~/)) {
                 var directory = data.name.split('~');

                 if (directories.indexOf(directory[0]) != -1) {
                 return;
                 }

                 directories.push(directory[0])
                 data.name = directory[0];
                 data.directory = true;
                 }

                 records.push(data);
                 });*/

                /*recordings.forEach(function (data) {
                    records[data.number] = data;
                });

                cb(records);
            }).on('error', function (e) {
                //log.dbg(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20);
            });*/
        }
    }
};

module.exports = RecordingCollection;