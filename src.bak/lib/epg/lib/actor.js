var db = null;

function actor (database) {
    db = database;
    
    return this;
}

actor.prototype.add = function (name, callback) {
    db.serialize(function () {
        db.get('SELECT * FROM actor WHERE name = ?', name, function (err, row) {
            if (typeof(row) == 'undefined') {
                db.run("INSERT INTO actor VALUES (NULL, ?)", name);
            }
        });
    });
};

actor.prototype.get = function (name, callback) {
    db.get('SELECT * FROM actor WHERE name = ?', name, function (err, row) {
        callback.apply(this, arguments);
    });
};

exports.init = actor;