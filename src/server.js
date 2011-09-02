var express = require('express');
var app = express.createServer();
var rest = require('restler');

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

app.all('*', function (req, res, next) {
    if (req.url == '/login') {
        next();
        return;
    }
    
    if (typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
        req.session.loggedIn = false;
        res.redirect('/login');
        return;
    }

    next();
});

app.get('/timeline', function(req, res) {
    var channels = new Object();
    
    rest.get('http://127.0.0.1:8002/channels/.json?&start=0&limit=10').on('complete', function(data, entry) {
        var render = function () {
            if (data.channels.length != waitForFinish) return;

            channels = ksort(channels);

            res.render('timeline', {
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
        
        var waitForFinish = 1;
        
        data.channels.forEach(function (channel) {
            rest.get('http://127.0.0.1:8002/events/' + channel.channel_id + '/86000.json?start=0', {channel: channel}).on('complete',  function (epg) {
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
    
    if (username == 'kersten' && password == 'manager') {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.redirect('/login?failed=true');
    }
    
    res.end();
});

app.get('/program', function (req, res) {
    res.render('program', {
        global: {
            title: 'Program',
            loggedIn: req.session.loggedIn,
            page: 'program'
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
    console.log('Requested unknown url: ' + req.url);
    res.redirect('/timeline');
});

app.listen(8007);

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
