global.log = require('node-logging');
var utils = require('util');
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
    });*/
});

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