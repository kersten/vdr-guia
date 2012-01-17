var events =  mongoose.model('Event');
var seasonDetails =  mongoose.model('SeasonDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Season (title, episode) {
    this.title = title;
    this.episode = episode;
}

Season.prototype.fetchInformation = function (season, next) {
    log.dbg('Fetching season informations for: ' + season.title);
    next();

    /*seasonDetails.findOne({'epg_name': self.title}, function (err, doc) {
        if (doc == null) {
            tmdb.Movie.search({
                query: self.title,
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    return;
                }

                for(var x in res) {
                    if (res[x] == "Nothing found.") {
                        return;
                    }

                    tmdb.Movie.getInfo({
                        query: res[x].id.toString(),
                        lang: 'de'
                    }, function (err, res) {
                        if(typeof(err) != 'undefined') {
                            return;
                        }

                        res[0].epg_name = self.title;

                        var seasonDetailsSchema = new seasonDetails(res[0]);
                        seasonDetailsSchema.save();
                    });
                }
            });
        }
    });*/
};

Season.prototype.fetchAll = function (callback) {
    var self = this;
    
    var query = events.find({
        themoviedbId: {$exists: false},
        themoviedbSearched: {$exists: false}
    });

    query.or([{ category: new RegExp('serie', 'ig') }, { type: new RegExp('serie', 'ig') }]);
    query.sort('title', 1);

    query.each(function (err, season, next) {
        if (season == null) {
            log.dbg('Fetching Seasons finished ..');
            callback();
            return;
        }

        if (season.title === undefined) {
            next();
            return;
        }

        self.fetchInformation(season, next);
    });
};

module.exports = Season;