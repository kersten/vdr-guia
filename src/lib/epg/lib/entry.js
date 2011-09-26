var db = null;

function init (database) {
    db = database;
    
    return entry;
}

function entry () {
    
}

entry.prototype.getAll = function (callback) {
    var self = this;
    
    db.all('SELECT * FROM event', function (err, result) {
        var data = new Array();
        
        for (var i in result) {
            data.push(self.process(result[i]));
        }
        
        callback.apply(data, arguments);
    });
};

entry.prototype.get = function (evenId) {
    
};

entry.prototype.process = function (data) {
    
};

entry.prototype.data = {
    title: null,
    short_description: null,
    description: null,
    category: null,
    gerne: null,
    rating: null,
    actors: null,
    country: null,
    regisseur: null,
    year: null,
    sequence: null,
    start_time: null,
    channel: null,
    duration: null,
    images: null,
    timer_exists: false,
    timer_active: false,
    timer_id: null
};

entry.prototype.hasActors = function () {
    
};

entry.prototype.hasCountry = function () {
    
};

entry.prototype.hasImages = function () {
    
};

entry.prototype.hasRegisseur = function () {
    
};

entry.prototype.hasYear = function () {
    
};

entry.prototype.getActors = function () {
    
};

entry.prototype.getCountry = function () {
    
};

entry.prototype.getImages = function () {
    
};

entry.prototype.getRegisseur = function () {
    
};

entry.prototype.getYear = function () {
    
};

exports.init = init;