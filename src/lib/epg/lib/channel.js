var db = null;

function channel (database) {
    db = database;
    
    return this;
}

channel.prototype.getAll = function (callback) {
    var self = this;
    
    db.all('SELECT * FROM channel', function (err, result) {
        var data = new Array();
        
        for (var i in result) {
            data.push(self.process(result[i]));
        }
        
        callback.call(this, data);
    });
};

channel.prototype.get = function (channelId) {
    
};

channel.prototype.add = function (obj, callback) {
    db.get('SELECT * FROM channel WHERE channel_id = ?', obj.channel_id, function (err, row) {
        if (typeof(row) == 'undefined') {
            db.run('INSERT INTO channel VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                obj.name,
                obj.number,
                obj.channel_id,
                obj.image,
                obj.group,
                obj.transponder,
                obj.stream,
                obj.is_atsc,
                obj.is_cable,
                obj.is_terr,
                obj.is_sat,
                obj.is_radio,
            ]);
        } else {
            // TODO: check for changes
        }
        
        callback.call();
    });
};

channel.prototype.addEvents = function (id, event, callback) {
    db.get('SELECT id FROM channel WHERE id = ?', id, function (err, row) {
        if (typeof(row) != 'undefined') {
            db.run("INSERT INTO event VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                event.id,
                event.title,
                event.short_description,
                event.description,
                event.start_time,
                event.duration,
                event.images,
                event.rating,
                event.year
            ], function (err, row) {
                console.log('Last inserted :: ' + this.lastID);

                db.run('INSERT INTO event2channel VALUES (?, ?)', [this.lastID, id]);
                
                if (event.details.length != "undefined")

                callback.call();
            });
        } else {
            callback.call();
        }
    });
};

channel.prototype.process = function (data) {
    var chan = new Channel(data);
    
    return chan;
};

var Channel = function (data) {
    this.id = data.id;
    this.name = data.name;
    this.number = data.number;
    this.channel_id = data.channel_id;
    this.image = data.image;
    this.group = data.group;
    this.transponder = data.transponder;
    this.stream = data.stream;
    this.is_atsc = data.is_atsc;
    this.is_cable = data.is_cable;
    this.is_terr = data.is_terr;
    this.is_sat = data.is_sat;
    this.is_radio = data.is_radio;
    
    return this;
};

exports.init = channel;