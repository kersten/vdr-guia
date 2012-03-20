var rest = require('restler');

var Setup = {
    listener: {
        checkrestful: function (data, cb) {
            var sendFalse = setTimeout(function () {
                cb({reachable: false});
            }, 10000);

            rest.get('http://' + data.vdrhost + ':' + data.restfulport + '/info.json').on('success', function(data) {
                clearTimeout(sendFalse);
                cb({reachable: true});
            }).on('error', function () {
                clearTimeout(sendFalse);
                cb({reachable: false});
            });
        },

        CheckUser: function () {

        }
    }
};

module.exports = Setup;