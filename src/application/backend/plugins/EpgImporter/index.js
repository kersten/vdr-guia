var EpgImport = require('../../../../lib/Epg/Import'),
    log = require('node-logging');

var EpgImporter = {
    running: false,

    init: function () {
        "use strict";

        this.importer();
    },

    importer: function () {
        "use strict";

        var _this = this;

        if (this.running) {
            return;
        }

        this.running = true;

        log.inf('Import EPG');

        var importer = new EpgImport(70);
        importer.start(function (hadEpg) {
            _this.running = false;

            if (hadEpg) {
                _this.importer();
                return;
            }

            log.inf('Import EPG finished');
        });
    },

    cronjobs: [{
        '0 0 */1 * * *': function () {
            EpgImporter.importer();
        }
    }]
};

module.exports = EpgImporter;