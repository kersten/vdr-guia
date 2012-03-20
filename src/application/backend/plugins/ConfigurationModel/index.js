var mongoose = require('mongoose'),
    Configuration = mongoose.model('Configuration'),
    User = mongoose.model('User');

var ConfigurationModel = {
    listener: {
        create: function (data, cb) {
            var model = data.model;

            var configuration = new Configuration({
                vdrHost: model.vdrhost,
                restfulPort: model.restfulport,
                epgscandelay: 1,
                fetchTmdbMovies: true,
                fetchTmdbActors: true,
                fetchThetvdbSeasons: true
            });

            var user = new User({
                user: model.username,
                password: model.password,
                socialize: false
            });

            configuration.save();
            user.save();
        }
    }
};

module.exports = ConfigurationModel;