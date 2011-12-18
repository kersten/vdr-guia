var events =  mongoose.model('Event');
var actorDetails =  mongoose.model('ActorDetails');

var tmdb = require('../Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

function Actor (actorId, actorName) {
    this.id = actorId;
    this.name = actorName;
}

Actor.prototype.fetchInformation = function () {
    var self = this;

    actorDetails.findOne({'epg_name': self.name}, function (err, doc) {
        if (doc == null) {
            tmdb.Person.search({
                query: self.name,
                lang: 'de'
            }, function (err, res) {
                if(typeof(err) != 'undefined') {
                    return;
                }

                for(var x in res) {
                    if (res[x] == "Nothing found.") {
                        return;
                    }

                    tmdb.Person.getInfo({
                        query: res[x].id.toString(),
                        lang: 'de'
                    }, function (err, res) {
                        if(typeof(err) != 'undefined') {
                            return;
                        }

                        res[0].actorID = self.id;

                        var actorDetailsSchema = new actorDetails(res[0]);
                        actorDetailsSchema.save();
                    });
                }
            });
        }
    });
};

module.exports = Actor;