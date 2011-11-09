var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname + '/lib/data/epg', function () {
    db.run('SELECT * FROM event', function (err, res) {
        if (err != null) {
            require('./lib/install').setup(db);
        }
    });
});

var channel = require('./lib/channel');
var entry = require('./lib/entry');
var actor = require('./lib/actor');

module.exports = {
    channel: new channel.init(db),
    entry: new entry.init(db),
    actor: new actor.init(db)
};