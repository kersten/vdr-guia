var sparql = require('sparql');

var client = new sparql.Client('http://de.dbpedia.org/sparql');

var query = '\
        PREFIX owl: <http://www.w3.org/2002/07/owl#> \
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX dc: <http://purl.org/dc/elements/1.1/> \
        PREFIX : <http://de.dbpedia.org/resource/> \
        PREFIX dbpedia2: <http://de.dbpedia.org/property/> \
        PREFIX dbpedia: <http://de.dbpedia.org/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
        PREFIX dbo: <http://de.dbpedia.org/ontology/> \
    SELECT ?s ?p ?o { \
        ?s rdfs:label "' + process.argv[2] + '"@de . \
        ?s ?p ?o \
    } ORDER BY 2';

client.query(query, function (err, res) {
    console.log('RAVE');

    if (err) {
        console.log(err);
    }

    res.results.bindings.forEach(function (res) {
        console.log(res);
        //if (res.abstract['xml:lang'] == 'de')
        //console.log(res.abstract.value, res);
        /*if (res.l['xml:lang'] == 'de' || res.l['xml:lang'] == 'en') {
         console.log(res.l.value);
         }*/
    });
});

/*
    dbpedia-owl:abstract
    dbpedia-owl:broadcstArea
    dbpedia-owl:country
    dbpedia-owl:firstAirDate
    dbpedia-owl:formerName
    dbpedia-owl:headquarter
    dbpedia-owl:locationCountry
    dbpedia-owl:owningCompany
    dbpedia-owl:pictureFormat
    dbpedia-owl:shareOfAudience
    dbpedia-owl:keyPerson
    dbpedia-owl:locationCountry
    dbpedia-owl:slogan
    dbpedia-owl:thumbnail
    dbpedia-owl:wikiPageExternalLink
    dbprop:available
    dbprop:country
    dbpprop:cableChan
    dbpprop:cableAvail
    dbpprop:cableServ
    dbpprop:formerNames
    dbpprop:launch
    dbpprop:logofile
    dbpprop:logosize
    dbpprop:name
    dbpprop:owner
    dbpprop:pictureFormat
    dbpprop:satAvail
    dbpprop:satChan
    dbpprop:satServ
    dbpprop:terrAvail
    dbpprop:terrChan
    dbpprop:terrServ
    dbpprop:web
    dbpprop:headquarters
    dbpprop:keyPeople
    dbpprop:launchDate
    dbpprop:networkLogo
    dbpprop:networkName
    dbpprop:networkType
    dbpprop:slogan
    dbpprop:website
    rdfs:comment
    rdfs:label
    foaf:depiction
    foaf:homepage
    foaf:name
    foaf:page
    dbpedia-owl:channel of
    dbpedia-owl:company of
    dbpedia-owl:network of
    dbpedia-owl:creator of
    dbpedia-owl:employer of
    dbpedia-owl:parentCompany of
    dbpedia-owl:sisterStation of
    dbpprop:channel of
    dbpprop:broadcaster of
    dbpprop:creator of
    dbpprop:employer of
    dbpprop:parent of
    dbpprop:company of
    dbpprop:network of
    dbpprop:sisterStation of
    dbpprop:distributor of
    dbpprop:producer of
    dbpprop:sisterNames of
    dbpprop:studio of
*/

/*client.query('\
        PREFIX owl: <http://www.w3.org/2002/07/owl#> \
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> \
        PREFIX dc: <http://purl.org/dc/elements/1.1/> \
        PREFIX : <http://de.dbpedia.org/resource/> \
        PREFIX dbpedia2: <http://de.dbpedia.org/property/> \
        PREFIX dbpedia: <http://de.dbpedia.org/> \
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \
        PREFIX dbo: <http://de.dbpedia.org/ontology/> \
    SELECT ?s ?p ?o { \
        ?s rdfs:label "' + process.argv[2] + '"@en . \
        ?s ?p ?o . \
    } order by 2', function (err, res) {
    if (err) {
        console.log(err);
    }

    res.results.bindings.forEach(function (res) {
        console.log(res);
        /*if (res.l['xml:lang'] == 'de' || res.l['xml:lang'] == 'en') {
            console.log(res.l.value);
        }
    });
});  */


/*var natural = require('natural'),
    TfIdf = natural.TfIdf,
    tfidf = new TfIdf();
    
tfidf.addDocument('Seitdem der mäßig erfolgreiche Drehbuchautor Henry seine Freundin Katharina rausgeschmissen hat, befindet er sich an einem persönlichen und kreativen Tiefpunkt. Unerwartet bekommt er die Chance, an der Adaption eines Bestseller-Romans mitzuarbeiten. Allerdings ist die Autorin, mit der er das Drehbuch erarbeiten soll, seine Ex-Freundin Katharina. Als er gerade wieder Gefühle für Katharina entwickelt, steht plötzlich die achtjährige Magdalena vor der Tür mit einem Brief in der Hand, in dem steht, dass er ihr Vater sei und gebeten werde, sie vorübergehend bei sich aufzunehmen, weil ihre Mutter Charlotte einen wichtigen Gerichtstermin wahrnehmen müsse. Dies stürzt ihn in ein Gefühlschaos: Katharina erfährt von dem Mädchen und beendet die Zusammenarbeit mit Henry, Charlotte übt auf ihn wieder eine Anziehungskraft aus und deren Partner Tristan, der anfangs abgeneigt war, Magdalena, die er bisher für seine leibliche Tochter hielt, bei sich aufzunehmen, will sie zurück haben. Und dies zu einem Zeitpunkt, als Henry merkte, dass ihm Magdalena ans Herz gewachsen ist. Er macht sich daran, mithilfe eines Drehbuches, welches er „Kokowääh“ nennt, dieser Situation Herr zu werden');
tfidf.addDocument('The fight must go on! Die Apokalypse, ausgelöst von der Umbrella Corporation, hat fast die gesamte Menschheit mit ihrem Virus infiziert und in mörderische Untote verwandelt. Alice, die auf der Suche nach weiteren Überlebenden ist, macht sich bereit, den skrupellosen Konzern endgültig zu vernichten. Sie begibt sich nach Los Angeles in der Hoffnung, dort für die letzten verbliebenen Menschen eine Oase des Friedens vorzufinden. Doch es ist zu spät! Auch hier haben sich bereits tausende Infizierte ausgebreitet und Alice und ihre Begleiter finden sich in einer scheinbar ausweglosen und tödlichen Falle wieder.');
tfidf.addDocument('Auf den ersten Blick sind Louise, Spencer und Victor ganz normale Nachbarn, die sich angefreundet haben. Man ratscht morgens im Flur, kommt abends mal auf einen Drink vorbei und isst gelegentlich zusammen. Aber ist Spencers breites Lächeln nicht zu strahlend und Louise intensive Beziehung zu ihren Katzen nicht ziemlich ungewöhnlich? Und der neu eingezogene Victor ist doch übertrieben hilfsbereit und freundlich. Man beobachtet sich genauer, stolpert über Ungereimtheiten und kommt Geheimnissen auf die Spur. Das Misstrauen wächst. Eine Mord- und Vergewaltigungsserie in der Umgebung bringt das nachbarschaftliche Gleichgewicht schliesslich vollends zum Kippen.');
tfidf.addDocument('Supermacho Tank verdient sich ein stattliches Zubrot, in dem er im Auftrag von deren Boyfriends junge Damen zu Dates ausführt und sich dort dann so dermassen daneben benimmt, bis jene weinend und reumütig in die Arme ihres Lovers zurückkehren. Tanks neuster Kunde ist sein bester Kumpel und Mitbewohner Dustin, der eine Nummer zu sensibel wirkt für seine neue Freundin, die heisse Alexis. Ohne jede Rücksicht präsentiert ihr Tank sein volles Programm, nur um zu erleben, wie Alexis voll darauf abfährt und sich zielgerichtet in das Schwein verliebt.');

console.log('das --------------------------------');
tfidf.tfidfs('das', function(i, measure) {
    console.log('document #' + i + ' is ' + measure);
});

console.log('Kokowääh --------------------------------');
tfidf.tfidfs('Kokowääh', function(i, measure) {
    console.log('document #' + i + ' is ' + measure);
});*/

// [ 'your', 'dog', 'has', 'flees' ]
// http://192.168.0.5:8008/recstream.html?recid=recording_e12420a2e7faf6bb3f1e6bb0d2cb2371
/*
var fs = require('fs'),
    stream = require('stream'),
    request = require('request'),
    http = require('http');


http.createServer(function (req, res) {
    var date = new Date();
    res.writeHead(200, {
        'Date':date.toUTCString(),
        'Connection':'close',
        'Cache-Control':'private',
        'Content-Type': 'video/h264'
    });
    
    var mypulldata = new stream.Stream();
    mypulldata.writable = true;

    var videoReq = request('http://192.168.0.5:3000/S19.2E-133-6-129.ts').pipe(mypulldata);

    mypulldata.write = function (chunk) {
        res.write(chunk);
    };
    
    mypulldata.end = function () {
        res.end();
    };
    
    res.connection.on('close', function() {
        videoReq.end();
    });  

}).listen(8000);

// http://192.168.0.5:8008/recstream.html?recid=recording_e12420a2e7faf6bb3f1e6bb0d2cb2371
/*var proc = new ffmpeg('http://192.168.0.5:3000/S19.2E-1-1017-61301.ts')
    .withSize('150x100')
    .takeScreenshots({
        count: 1,
        timemarks: [ '0.5' ]
    }, '/tmp/', function(err) {
        console.log(arguments);
        console.log('screenshots were saved')
    });


var ffmpegmeta = require('fluent-ffmpeg').Metadata;

// make sure you set the correct path to your video file
ffmpegmeta.get('http://192.168.0.5:3000/S19.2E-1-1017-61301.ts', function(metadata) {
    console.log(arguments);
});*/
/*var utils = require('util');
var dnode = require('dnode');

dnode.connect('guia-server.yavdr.tv', 7007, function (remote, connection) {
    remote.register('kersten', 'peter', 'kerstenk@gmail.com', function (data) {
        console.log(data);
    });

    /*remote.authenticate('kersten', 'peter', '$2a$10$Y/kHr9RLqMuf39ab5Jcq6e', function (session) {
        if (session) {
            session.getRating('X-Men', function (result) {
                console.log(result);
            });
        }
    });
});*/

/* var trakt = require('trakt').Client;
var user = require('trakt/user');
var search = require('trakt/search');

var client = new trakt('08792ab79fda9119a2d18dcefeaa594f');

//client.extend('user', new user());
client.extend('search', new search());

utils.debug(utils.inspect(client.search,true, null));

/*client.user.shows({username: 'GOTTMODUS'}, function (data) {
    console.log(data);
});

client.search.shows({query: 'How+I+Met+Your+Mother'}, function (data) {
    console.log(data);
});

client.search.users({query: 'How+I+Met+Your+Mother'}, function (data) {
    console.log(data);
}); */

/*var Thetvdb = require('./src/lib/Media/Scraper/Thetvdb');

var tvdb = new Thetvdb('3258B04D58376067', 'de');
tvdb.getSeries('Dexter', function (result) {
    console.log(result);
});*/

/*global.mongoose = require('mongoose');
global.Schema = mongoose.Schema;

require('./src/schemas/ChannelSchema');
require('./src/schemas/EventSchema');
require('./src/schemas/ActorSchema');
require('./src/schemas/ActorDetailSchema');
require('./src/schemas/MovieDetailSchema');

console.log('Connect to database ..');
mongoose.connect('mongodb://127.0.0.1/GUIA');
mongoose.connection.on('error', function (e) {
    throw e;
});

var Epg = require('./src/lib/Epg');
var epg = new Epg();

epg.getTodaysHighlight();*/
//process.exit();

/*var date = new Date();
date.setHours(0, 0, 0);

var start = parseInt(date.getTime() / 1000);

date.setHours(23, 59, 59);

var stop = parseInt(date.getTime() / 1000);

events.find({tip: {$exists: true}, start: {$gt: start, $lt: stop}}, function (err, docs) {
    console.log(docs);
    console.log(start, stop);
    process.exit();
});*/
