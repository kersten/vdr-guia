var events =  mongoose.model('Event');
var seasonDetails =  mongoose.model('SeasonDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Season (title, episode) {
    this.title = title;
    this.episode = episode;
}

Season.prototype.fetchInformation = function () {
    var self = this;

    seasonDetails.findOne({'epg_name': self.title}, function (err, doc) {
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
    });
};

module.exports = Season;