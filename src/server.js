var express = require('express');
var app = express.createServer();
var rest = require('restler');
var monomi = require("monomi");
var config = require('./etc/config');
var ksort = require('./lib/ksort');

app.configure('development', function() {

    app.use(express.static(__dirname + '/../public/'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.register('.html', require('ejs'));

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

var RedisStore = require('connect-redis')(express);
app.use(express.bodyParser());
app.use(monomi.detectBrowserType());
app.use(express.cookieParser());
app.use(express.session({secret: config.redis.secret, store: new RedisStore}));

var restfulUrl = 'http://' + config.vdr.host + ':' + config.vdr.restfulport;
var isMobileDevice = false;

app.all('*', function (req, res, next) {
    if (req.monomi.browserType in {'tablet': '', 'touch': '', 'mobile': ''}) {
        isMobileDevice = true;
    }
    
    if (req.url == '/login') {
        next();
        return;
    }
    
    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;
        res.redirect('/login');
        return;
    }
    
    if (req.url == '/') {
        res.redirect('/timeline');
        return;
    }

    next();
});

app.get('/timeline', function(req, res) {
    var channels = new Object();
    
    rest.get(restfulUrl + '/channels/.json?&start=0&limit=10').on('complete', function(data) {
        var render = function () {
            if (data.channels.length != waitForFinish) return;

            channels = ksort(channels);

            res.render((isMobileDevice) ? 'mob/timeline': 'timeline', {
                layout: (isMobileDevice) ? 'mob/layout': 'layout',
                global: {
                    title: 'Timeline',
                    loggedIn: req.session.loggedIn,
                    page: 'timeline'
                },
                channels: channels
            });
        };
        
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
            rest.get(restfulUrl + '/events/' + channel.channel_id + '/86000.json?start=0', {channel: channel}).on('complete',  function (epg) {
                channels[this.options.channel.number] = {
                    channel: this.options.channel,
                    epg: epg
                };
                
                waitForFinish++;
                render();
            }).on('error', function (err) {
                waitForFinish++;
                render();
            }).on('404', function () {
                waitForFinish++;
                render();
            });
        });
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
    
    if (username == config.username && password == config.password) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.redirect('/login?failed=true');
    }
    
    res.end();
});

app.get('/program', function (req, res) {
    var chan = req.param("chan", 0);
    
    rest.get(restfulUrl + '/channels/.json?&start=0').on('complete', function(data) {
        rest.get(restfulUrl + '/events/' + data.channels[chan].channel_id + '/86000.json?start=0').on('complete',  function (epg) {
            res.render('program', {
                global: {
                    title: 'Program',
                    loggedIn: req.session.loggedIn,
                    page: 'program'
                },
                channel: data.channels[chan],
                channelEpg: epg.events,
                channels: data.channels
            });
        });
    });
});

app.get('/watch', function (req, res) {
    res.render('watch', {
        global: {
            title: 'Watch',
            loggedIn: req.session.loggedIn,
            page: 'watch'
        }
    });
});

app.get('/timer', function (req, res) {
    rest.get(restfulUrl + '/timers.json').on('complete', function(data) {
        var sorted = new Array();
        
        for (i in data.timers) {
            sorted[data.timers[i].day + '' +data.timers[i].start] = data.timers[i];
        }
        
        sorted = ksort(sorted);
        
        data.timers = new Array();
        
        for (i in sorted) {
            data.timers.push(sorted[i]); 
        }
        
        res.render('timer', {
            global: {
                title: 'Timer',
                loggedIn: req.session.loggedIn,
                page: 'timer'
            },
            timers: data.timers
        });
    });
});

app.get('/search', function (req, res) {
    if (req.param("q", "") != "") {
        var start = req.param("site", 1) * config.app.entries;
    
        rest.post(restfulUrl + '/events/search.json?start=' + start + '&limit=' + config.app.entries, {
            data: {
                query: req.param("q"),
                mode: 0,
                channelid: 0,
                use_title: true,
                use_subtitle: (req.param("s", false) != false) ? true : false,
                use_description: (req.param("d", false) != false) ? true : false
            }
        }).on('complete', function(data) {
            console.log(Math.floor(data.total / config.app.entries));
            res.render('search', {
                global: {
                    title: 'Search',
                    loggedIn: req.session.loggedIn,
                    page: 'search'
                },
                results: data.events,
                paginator: {
                    total: data.total,
                    cur: parseInt(req.param("site", 1)),
                    sites: Math.floor(data.total / config.app.entries),
                    next: parseInt(req.param("site", 1)) + 1,
                    previous: parseInt(req.param("site", 1)) -1
                },
                q: req.param("q", ""),
                s: req.param("s", ""),
                d: req.param("d", "")
            });
        });
    } else {
        res.render('search', {
            global: {
                title: 'Search',
                loggedIn: req.session.loggedIn,
                page: 'search'
            },
            q: req.param("q", ""),
            s: req.param("s", ""),
            d: req.param("d", "")
        });
    }
});

app.get('/searchtimer', function (req, res) {
    res.render('searchtimer', {
        global: {
            title: 'Searchtimer',
            loggedIn: req.session.loggedIn,
            page: 'searchtimer'
        }
    });
});

app.get('/records', function (req, res) {
    res.render('records', {
        global: {
            title: 'Records',
            loggedIn: req.session.loggedIn,
            page: 'records'
        }
    });
});

app.get('/about', function (req, res) {
    res.render('about', {
        global: {
            title: 'About',
            loggedIn: req.session.loggedIn,
            page: 'about'
        }
    });
});

app.get('/logout', function (req, res) {
    if (typeof(req.session.loggedIn) != 'undefined' && req.session.loggedIn) {
        req.session.loggedIn = false;
        res.redirect('/');
        return;
    } else {
        res.redirect('/login');
        return;
    }
});

app.get('*', function(req, res) {
    res.render('404', {
        global: {
            title: '404 - Site not found',
            loggedIn: req.session.loggedIn,
            page: '404'
        }
    });
});

app.listen(config.web.port);
