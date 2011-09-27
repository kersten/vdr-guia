require.paths.unshift(__dirname + "/src/lib");
require.paths.unshift(__dirname + "/src/models");
require(__dirname + '/src/ModelFactory.js');
var util = require('util'),    
    http = require('http'),
    RawEventItemModel = require(__dirname + '/src/models/RawEventItemModel.js');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('hello, i know nodejitsu.')
  res.end();
}).listen(8000);

/*var RawEventItem = new RawEventItemModel.init({
    id: 63843787,
  title: 'Dialog mit meinem Gärtner',
  short_text: '',
  description: ' Zusammenfassung: Eine Schaffenskrise führt einen Pariser Künstler zurück in die Provinz, wo er das Haus seiner Eltern bezieht. Hier knüpft er an die Freundschaft mit einem alten Schulkameraden an. Der pensionierte Eisenbahner, der dem Maler den verwilderten Garten wieder herrichten soll, entpuppt sich als tiefgründiger Mensch, der dem abgehobenen Künstler die Augen für die Schönheit der einfachen Dinge öffnet.',
  start_time: 1317161595,
  channel: 'S19.2E-1-1007-4912',
  duration: 6119,
  images: 1,
  timer_exists: false,
  timer_active: false,
  timer_id: '',
  parental_rating: 0,
  components: 
   [ { stream: 5,
       type: 11,
       language: 'deu',
       description: 'H.264/AVC high definition Video,  16:9 aspect ratio,' },
     { stream: 2,
       type: 3,
       language: 'deu',
       description: 'stereo deutsch' },
     { stream: 2,
       type: 3,
       language: 'eng',
       description: 'stereo englisch' },
     { stream: 2,
       type: 5,
       language: 'deu',
       description: 'Dolby Digital 2.0' } ],
  details: 
   [ { key: 'REGISSEUR', value: 'Jean Becker' },
     { key: 'ACTORS',
       value: 'Daniel Auteuil (Der Maler) - Jean-Pierre Darroussin (Der Gärtner) - Fanny Cottençon (Hélène) - Alexia Barlier (Magda) - Hiam Abbass (Die Frau des Gärtners) - Elodie Navarre (Carole)' },
     { key: 'YEAR', value: '2007' },
     { key: 'COUNTRY', value: 'F' } ],
  rating: 5
});*/

//console.log(RawEventItem.toJSON());

var epgdata2vdr = require('epgdata2vdr');
var setup = new epgdata2vdr.Setup('http://192.168.0.192:8002');