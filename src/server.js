var express = require('express');
var app = express.createServer();
var rest = require('restler');
var monomi = require("monomi");
var config = require('./etc/config');

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
    var chan = 0;
    
    if (req.param("chan")) {
        chan = req.param("chan")
    }
    
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

app.post('/program', function (req, res) {
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
    res.render('search', {
        global: {
            title: 'Search',
            loggedIn: req.session.loggedIn,
            page: 'search'
        }
    });
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

function ksort (inputArr, sort_flags) {
    // Sort an array by key  
    // 
    // version: 1107.2516
    // discuss at: http://phpjs.org/functions/ksort    // +   original by: GeekFG (http://geekfg.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %          note 1: The examples are correct, this is a new way
    // %        note 2: This function deviates from PHP in returning a copy of the array instead    // %        note 2: of acting by reference and returning true; this was necessary because
    // %        note 2: IE does not allow deleting and re-adding of properties without caching
    // %        note 2: of property position; you can set the ini of "phpjs.strictForIn" to true to
    // %        note 2: get the PHP behavior, but use this only if you are in an environment
    // %        note 2: such as Firefox extensions where for-in iteration order is fixed and true    // %        note 2: property deletion is supported. Note that we intend to implement the PHP
    // %        note 2: behavior by default if IE ever does allow it; only gives shallow copy since
    // %        note 2: is by reference in PHP anyways
    // %        note 3: Since JS objects' keys are always strings, and (the
    // %        note 3: default) SORT_REGULAR flag distinguishes by key type,    // %        note 3: if the content is a numeric string, we treat the
    // %        note 3: "original type" as numeric.
    // -    depends on: i18n_loc_get_default
    // -    depends on: strnatcmp
    // *     example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};    // *     example 1: data = ksort(data);
    // *     results 1: {a: 'orange', b: 'banana', c: 'apple', d: 'lemon'}
    // *     example 2: ini_set('phpjs.strictForIn', true);
    // *     example 2: data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'};
    // *     example 2: ksort(data);    // *     results 2: data == {1: 'Kevin', 2: 'van', 3: 'Zonneveld'}
    // *     returns 2: true
    var tmp_arr = {},
        keys = [],
        sorter, i, k, that = this,        strictForIn = false,
        populateArr = {};
 
    switch (sort_flags) {
    case 'SORT_STRING':        // compare items as strings
        sorter = function (a, b) {
            return that.strnatcmp(a, b);
        };
        break;    case 'SORT_LOCALE_STRING':
        // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
        var loc = this.i18n_loc_get_default();
        sorter = this.php_js.i18nLocales[loc].sorting;
        break;    case 'SORT_NUMERIC':
        // compare items numerically
        sorter = function (a, b) {
            return ((a + 0) - (b + 0));
        };        break;
        // case 'SORT_REGULAR': // compare items normally (don't change types)
    default:
        sorter = function (a, b) {
            var aFloat = parseFloat(a),                bFloat = parseFloat(b),
                aNumeric = aFloat + '' === a,
                bNumeric = bFloat + '' === b;
            if (aNumeric && bNumeric) {
                return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;            } else if (aNumeric && !bNumeric) {
                return 1;
            } else if (!aNumeric && bNumeric) {
                return -1;
            }            return a > b ? 1 : a < b ? -1 : 0;
        };
        break;
    }
     // Make a list of key names
    for (k in inputArr) {
        if (inputArr.hasOwnProperty(k)) {
            keys.push(k);
        }    }
    keys.sort(sorter);
 
    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;
     // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        k = keys[i];
        tmp_arr[k] = inputArr[k];
        if (strictForIn) {            delete inputArr[k];
        }
    }
    for (i in tmp_arr) {
        if (tmp_arr.hasOwnProperty(i)) {            populateArr[i] = tmp_arr[i];
        }
    }
 
    return strictForIn || populateArr;
}
