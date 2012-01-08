var channels = mongoose.model('Channel');
var rest = require('restler');

function Channel (restful) {
    this.restful = restful;
}

Channel.prototype.count = function (callback) {
    channels.count({}, function (err, cnt) {
        callback(cnt);
    });
};

Channel.prototype.import = function (callback) {
    var ChannelImport = require('./Import');
    var channelImporter = new ChannelImport(this.restful);
    
    channelImporter.start(function () {
        callback();
    });
};

Channel.prototype.getAll = function (options, callback) {
    if (typeof(options) == 'function') {
        callback = options;
    }
    
    if (options.restful !== undefined) {
        this.restful = options.restful;
    }
    
    var self = this;
    var query = channels.find({});

    if (options !== undefined && options.limit !== undefined) {
        var start = options.page * options.limit - options.limit;

        query.skip(start);
        query.limit(options.limit);
    }

    if (options !== undefined && options.active !== undefined) {
        query.where('active', true);
    }

    query.sort('number', 1);
    
    this.count(function (cnt) {
        if (cnt == 0) {
            self.import(function () {
                query.exec(function (err, docs) {
                    callback(docs);
                });
            });
        } else {
            query.exec(function (err, docs) {
                callback(docs);
            });
        }
    });
};

module.exports = Channel;