var rest = require('restler'),
    mongoose = require('mongoose'),
    Configuration = mongoose.model('Configuration');

var RecordingCollection = {
    listener: {
        "read": function (data, cb) {
            if (!this.handshake.session.loggedIn && data.install === undefined) {
                return false;
            }

            Configuration.findOne({}, function (err, doc) {
                if (doc) {
                    var restful = 'http://' + doc.get('vdrHost') + ':' + doc.get('restfulPort');

                    rest.get(restful + '/recordings.json').on('success',  function (recordings) {
                        recordings = recordings.recordings;
                        var records = [],
                            directories = [];

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

                         cb(recordings);
                     }).on('error', function (e) {
                         //log.dbg(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20);
                     });
                }
            });
        }
    }
};

module.exports = RecordingCollection;