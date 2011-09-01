var express = require('express');
var app = express.createServer();
var rest = require('restler');
var microtime = require('microtime');

app.configure('development', function(){
    app.use(express.static(__dirname + '/../public'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.register('.html', require('ejs'));

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

var RedisStore = require('connect-redis')(express);
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: "keyboard cat", store: new RedisStore}));

app.get('/', function(req, res) {
    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;
        res.redirect('/login');
        return;
    }
    
    var channels = new Array();
    
    rest.get('http://192.168.0.192:8002/channels/.json?&start=0&limit=10').on('complete', function(data) {
        /*
         * name: 'arte HD',
         * number: 5,
         * channel_id: 'S19.2E-1-1011-11120',
         * image: false,
         * group: 'Public HDTV FTA',
         * transponder: 111361,
         * stream: 'S19.2E-1-1011-11120.ts',
         * is_atsc: false,
         * is_cable: false,
         * is_terr: false,
         * is_sat: true,
         * is_radio: false
         */
        
        var waitForFinish = 0;
        
        data.channels.forEach(function (channel) {
            rest.get('http://192.168.0.192:8002/events/' + channel.channel_id + '/86400.json ').on('complete',  function (data) {
                channel.epg = data;
                channels.push(channel);
                
                waitForFinish++;
                render();
            });
        });
        
        var render = function () {
            if (data.channels.length != waitForFinish) return;

            console.log(channels);

            res.render('timeline', {
                global: {
                    title: 'Startseite',
                    loggedIn: req.session.loggedIn,
                    page: 'timeline'
                },
                channels: channels
            });
        }
    }).on('error', function () {
        console.log('No Host');
    });
});

app.get('/login', function(req, res) {
    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;
    } else {
        res.redirect('/');
        return;
    }

    res.render('login', {
        global: {
            title: 'Login',
            loggedIn: req.session.loggedIn,
            page: 'login'
        },
        err: req.param('failed', false)
    });
});

app.post('/login', function (req, res) {
    var username = req.param("username");
    var password = req.param("password");
    
    if (username == 'kersten' && password == 'manager') {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.redirect('/login?failed=true');
    }
    
    res.end();
});



app.listen(8007);
