var express = require('express');
var app = express.createServer();
var http = require('http');
var rest = require('restler');
var monomi = require("monomi");
var i18n = require("i18n");
var syslog = require('node-syslog');
var config = require('./etc/config');
var ksort = require('./lib/ksort');
var categories = require('./lib/category_mapper');

app.configure('development', function() {
    syslog.init("VDRManager", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
    syslog.log(syslog.LOG_INFO, "Starting VDRManager webserver");

    app.use(i18n.init);
    //app.use(app.router);
    app.use(express.static(__dirname + '/../public/'));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'de'],

    // where to register __() and __n() to, might be "global" if you know what you are doing
    register: global
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

    /*if (req.url == '/login') {
        next();
        return;
    }
    */

    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;

        if (req.url != '/' && req.url != '/login' && req.url != '/login.do') {
            res.writeHead(403);
            res.end();
            return;
        }
    }

    /*if (req.url == '/') {
        res.redirect('/timeline');
        return;
    }*/

    next();
});

app.get('/', function (req, res) {
    res.render('layout', {
        layout: true,
        global: {
            loggedIn: req.session.loggedIn,
            page: 'layout'
        }
    });
});

app.post('/menu', function (req, res) {
    res.render('menu', {
        layout: false,
        global: {
            loggedIn: req.session.loggedIn,
            page: 'menu'
        }
    });
});

app.post('/menu/channellist', function (req, res) {
    rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
        res.render('menu/channels', {
            layout: false,
            channels: data.channels
        });
    });
});

app.post('/timeline', function(req, res) {
    var channels = new Object();

    rest.get(restfulUrl + '/channels/.json?&start=0&limit=10').on('complete', function(data) {
        var render = function () {
            if (data.channels.length != waitForFinish) return;

            channels = ksort(channels);

            res.render((isMobileDevice) ? 'mob/timeline': 'timeline', {
                layout: false,
                global: {
                    title: 'Timeline',
                    loggedIn: req.session.loggedIn,
                    page: 'timeline'
                },
                channels: channels,
                switchUrl: restfulUrl + '/remote/switch',
                ts: Math.round((new Date()).getTime() / 1000)
            });
        };

        var waitForFinish = 0;

        data.channels.forEach(function (channel) {
            rest.get(restfulUrl + '/events/' + channel.channel_id + '.json?start=0', {channel: channel}).on('complete',  function (epg) {
                for (var i in epg.events) {
                    //var regEx = /Kategorie: (.*?)$/im; // tvm2vdr
                    var regEx = /^(.*?)\ .*$/i;
                    regEx.exec(epg.events[i].short_text);

                    if (RegExp.$1 == "") {
                        regEx.exec(epg.events[i].description);
                    }

                    var cat = RegExp.$1;

                    console.log(cat);
                    for (var x in categories) {
                        for(var y = 0; y < categories[x].equals.length; y++) {
                            if(categories[x].equals[y] == cat) {
                                epg.events[i].category = x;
                                epg.events[i].color = categories[x].color;
                                break;
                            }
                        }

                        if (typeof(epg.events[i].category) == 'undefined') {
                            for(var y = 0; y < categories[x].regex.length; y++) {
                                if(cat.match(categories[x].regex[y])) {
                                    epg.events[i].category = x;
                                    epg.events[i].color = categories[x].color;
                                    break;
                                }
                            }
                        }

                        if (typeof(epg.events[i].category) != 'undefined') {
                            break;
                        }
                    }

                    if (typeof(epg.events[i].category) == 'undefined') {
                        epg.events[i].category = 'Sonstiges';
                        epg.events[i].color = {
                            'background-color': '#CCCCCC',
                            'background-image': '-moz-linear-gradient(center top , #666666, #CCCCCC)',
                            'font-color': '#000000'
                        };
                    }
                }

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

app.post('/tvguide', function (req, res) {
    res.render('tvguide', {
        layout: false,
        global: {
            title: 'TV Guide',
            loggedIn: req.session.loggedIn,
            page: 'tvguide'
        },
        err: req.param('failed', false)
    });
});

app.post('/login', function(req, res) {
    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;
    } else {
        res.redirect('/');
        return;
    }

    res.render('login', {
        layout: false,
        global: {
            title: 'Login',
            loggedIn: req.session.loggedIn,
            page: 'login'
        }
    });
});

app.post('/login.do', function (req, res) {
    var username = req.param("username");
    var password = req.param("password");

    if (username == config.app.username && password == config.app.password) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.writeHead(403);
        res.end();
    }

    res.end();
});

app.post('/program', function (req, res) {
    var chan = req.param("channel", false);
    
    if (chan == false) {
        res.render('program', {
            layout: false,
            global: {
                title: 'Program',
                loggedIn: req.session.loggedIn,
                page: 'program',
                maxEntries: config.app.entries
            },
            paginator: {
                total: 0
            },
            switchUrl: restfulUrl + '/remote/switch',
            restfulUrl: restfulUrl
        });
        return;
    }
    
    var start = (req.param("site", 1) - 1) * config.app.entries;
    
    rest.get(restfulUrl + '/events/' + chan + '.json?timespan=0&start=' + start + '&limit=' + config.app.entries).on('complete',  function (epg) {
        res.render('program', {
            layout: false,
            global: {
                title: 'Program',
                loggedIn: req.session.loggedIn,
                page: 'program',
                maxEntries: config.app.entries
            },
            channelEpg: epg.events,
            paginator: {
                total: epg.total,
                cur: parseInt(req.param("site", 1)),
                sites: Math.floor(epg.total / config.app.entries),
                next: parseInt(req.param("site", 1)) + 1,
                previous: parseInt(req.param("site", 1)) -1
            },
            switchUrl: restfulUrl + '/remote/switch',
            restfulUrl: restfulUrl
        });
    }).on('error', function () {
        syslog.log(syslog.LOG_ERR, 'Error getting epg for channel ' + chan);
    });
});

app.post('/watch', function (req, res) {
    res.render('watch', {
        layout: false,
        global: {
            title: 'Watch',
            loggedIn: req.session.loggedIn,
            page: 'watch'
        }
    });
});

app.post('/timer', function (req, res) {
    var start = (req.param("site", 1) - 1) * config.app.entries;

    rest.get(restfulUrl + '/timers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
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
            layout: false,
            global: {
                title: 'Timer',
                loggedIn: req.session.loggedIn,
                page: 'timer',
                maxEntries: config.app.entries
            },
            timers: data.timers,
            paginator: {
                total: data.total,
                cur: parseInt(req.param("site", 1)),
                sites: Math.floor(data.total / config.app.entries),
                next: parseInt(req.param("site", 1)) + 1,
                previous: parseInt(req.param("site", 1)) -1
            },
            restfulUrl: restfulUrl
        });
    });
});

app.post('/search', function (req, res) {
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
            console.log(data);

            res.render('search', {
                layout: false,
                global: {
                    title: 'Search',
                    loggedIn: req.session.loggedIn,
                    page: 'search',
                    maxEntries: config.app.entries
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
            layout: false,
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

app.post('/searchtimer', function (req, res) {
    var start = req.param("site", 0) * config.app.entries;

    rest.get(restfulUrl + '/searchtimers.json?start=' + start + '&limit=' + config.app.entries).on('complete', function(data) {
        var sorted = new Array();

        for (i in data.searchtimers) {
            sorted[data.searchtimers[i].id] = data.searchtimers[i];
        }

        sorted = ksort(sorted);

        data.searchtimers = new Array();

        for (i in sorted) {
            data.searchtimers.push(sorted[i]);
        }

        console.log(data);

        res.render('searchtimer', {
            layout: false,
            global: {
                title: 'Searchtimer',
                loggedIn: req.session.loggedIn,
                page: 'searchtimer',
                maxEntries: config.app.entries
            },
            searchtimers: data.searchtimers,
            paginator: {
                    total: data.total,
                    cur: parseInt(req.param("site", 1)),
                    sites: Math.floor(data.total / config.app.entries),
                    next: parseInt(req.param("site", 1)) + 1,
                    previous: parseInt(req.param("site", 1)) -1
                }
        });
    });
});

app.post('/records', function (req, res) {
    res.render('records', {
        layout: false,
        global: {
            title: 'Records',
            loggedIn: req.session.loggedIn,
            page: 'records'
        }
    });
});

app.post('/settings', function (req, res) {
    res.render('settings', {
        layout: false,
        global: {
            title: 'Settings',
            loggedIn: req.session.loggedIn,
            page: 'settings'
        },
        config: config
    });
});

app.post('/settings/vdrmanager', function (req, res) {
    res.render('settings/vdrmanager', {
        layout: false,
        config: config
    });
});

app.post('/settings/timeline', function (req, res) {
    res.render('settings/timeline', {
        layout: false,
        config: config
    });
});

app.post('/settings/tvguide', function (req, res) {
    res.render('settings/tvguide', {
        layout: false,
        config: config
    });
});

/*app.post('/settings', function (req, res) {
    for (var i in req.body) {
        console.log(i + ' :: ' + req.body[i]);
    }

    res.redirect('/settings');
    res.end();
});*/

app.post('/about', function (req, res) {
    res.render('about', {
        layout: false,
        global: {
            title: 'About',
            loggedIn: req.session.loggedIn,
            page: 'about'
        }
    });
});

app.post('/details', function (req, res) {
    var eventId = req.param("eventid", false);
    var channelId = req.param("channelid", false);

    if (!eventId || !channelId) {
        res.end();
        return;
    }

    rest.get(restfulUrl + '/events/' + channelId + '/' + eventId + '.json').on('complete', function(data) {
        console.log(data);

        res.render('details', {
            layout: false,
            global: {
                title: 'Details on ' + data.events[0].title,
                loggedIn: req.session.loggedIn,
                page: 'details'
            },
            broadcast: data.events[0]
        });
    });
});

app.post('/logout', function (req, res) {
    if (typeof(req.session.loggedIn) != 'undefined' && req.session.loggedIn) {
        req.session.loggedIn = false;
        res.render('login', {
            layout: false
        });
    } else {
        res.render('login', {
            layout: false
        });
    }
});

app.get('*', function(req, res) {
    res.render('404', {
        layout: false,
        global: {
            title: '404 - Site not found',
            loggedIn: req.session.loggedIn,
            page: '404'
        }
    });
});

app.listen(config.web.port);
