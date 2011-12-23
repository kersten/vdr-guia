var Thetvdb = require('./src/lib/Media/Scraper/Thetvdb');

var tvdb = new Thetvdb('3258B04D58376067', 'de');
tvdb.getSeries('Dexter', function (result) {
    console.log(result);
});

/*var tmdb = require('./src/lib/Media/Scraper/Tmdb').init({
    apikey:'5a6a0d5a56395c2e497ebc7c889ca88d'
});

tmdb.Movie.search({
    query: 'Matrix',
    lang: 'de'
}, function(err,res) {
    for(var x in res) {
        tmdb.Movie.getInfo({
            query: res[x].id.toString(),
            lang: 'de'
        }, function (err, res) {
            console.log(res[0].cast);
        });
    }
});*/