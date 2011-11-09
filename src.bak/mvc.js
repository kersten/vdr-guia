/**
 * Module dependencies.
 */

var fs = require('fs'),
    express = require('express'),
    syslog = require('node-syslog'),
    i18n = require("i18n"),
    config = require('./etc/config'),
    monomi = require("monomi"),
    rest = require('restler'),
    wol = require('wake_on_lan'),
    thetvdb = require('./lib/thetvdb.org'),
    sys = require('sys'),
    exec = require('child_process').exec,
    iniparser = require('iniparser');

exports.boot = function (app, io){
  bootApplication(app, io);
};

// App settings and middleware
function bootApplication (app, io) {
    var RedisStore = require('connect-redis')(express);
    var store = new RedisStore;
    app.use(express.bodyParser());
    app.use(monomi.detectBrowserType());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: config.redis.secret,
        store: store,
        key: 'vdrmanager.id'
    }));

    //app.use(express.logger());

    syslog.init("VDRManager", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
    syslog.log(syslog.LOG_INFO, "Starting VDRManager webserver");

    app.use(i18n.init);

    i18n.configure({
        // setup some locales - other locales default to en silently
        locales:['en', 'de'],

        // where to register __() and __n() to, might be "global" if you know what you are doing
        register: global
    });

    app.register('.html', require('ejs'));
    app.register('.js', require('ejs'));

    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');

    app.use(express.static(__dirname + '/public'));
    app.use(app.router);

    app.configure('development', function(){
        app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
    });

    app.error(function(err, req, res, next){
        if (err instanceof NotFound) {
            res.render('404', {
                layout: false,
                global: {
                    title: '404 - Site not found',
                    loggedIn: req.session.loggedIn
                }
            });
        } else {
            next(err);
        }
    });

    global.ksort = require('./lib/ksort');
    global.rest = rest;
    global.restfulUrl = 'http://' + config.vdr.host + ':' + config.vdr.restfulport;
    global.config = config;
    
    global.vdr = {
        plugins: {},
        channelList: [],
        genremap: iniparser.parseSync('/etc/epgdata2vdr/genremap.conf')
    };
    
    console.log(iniparser.parseSync('/etc/epgdata2vdr/genremap.conf'));
    
    global.io = io;
    global.sessionStore = store;
    
    global.thetvdb = thetvdb.createService({
        apikey: '3258B04D58376067'
    });

    function checkVDRRunning () {
        var running = false;
        
        function puts () {
            clearTimeout(running);
            checkVDRPlugins();
        }

        exec("ping -c 3 " +  config.vdr.host, puts);
        
        running = setTimeout(function() {
            console.log('VDR is not alive. Try to wake up VDR');
            
            wol.wake(config.vdr.mac, function(error) {
                if (error) {
                    console.log('Some error occurred sending the WOL pakages!');
                } else {
                    console.log('Done sending WOL packages to VDR! Try again in 1 Minute.');
                    setTimeout(checkVdrRunning, 60000);
                }
            });
        }, 10000);
    }

    function checkVDRPlugins () {
        console.log('VDR check for plugins');
        
        rest.get(restfulUrl + '/info.json').on('complete', function(data) {
            vdr.plugins.epgsearch = false;

            for (var i in data.vdr.plugins) {
                vdr.plugins[data.vdr.plugins[i].name] = true;
            }

            setupBasics();
        });
    }
    
    function setupBasics () {
        function getChannelList () {
            rest.get(restfulUrl + '/channels.json?start=0').on('complete', function(data) {
                vdr.channelList = data.channels;
            });
        }
        
        getChannelList();
        
        var channelUpdateInterval = setInterval(getChannelList, 60*1000*30);
        
        bootControllers(app);
    }
    
    checkVDRRunning();

    // Some dynamic view helpers
    app.dynamicHelpers({
        request: function(req){
            return req;
        },
        current_user: function(req) {
            return req.session;
        },
        hasMessages: function(req){
            if (!req.session) return false;
            return Object.keys(req.session.flash || {}).length;
        },

        messages: function(req){
            return function () {
                var msgs = req.flash();
                return Object.keys(msgs).reduce(function(arr, type){
                    return arr.concat(msgs[type]);
                }, []);
            }
        }
    });
}

// Bootstrap controllers

function bootControllers (app) {
    fs.readdir(__dirname + '/controllers', function(err, files){
        if (err) throw err;
        files.forEach(function(file){
            bootController(app, file);
        });
    });
}

// Example (simplistic) controller support

function bootController (app, file) {
    console.log('Boot ' + file);

    var name = file.replace('.js', ''),
        actions = require('./controllers/' + name),
        //plural = name + 's', // realistically we would use an inflection lib
        prefix = '/' + name;

    // Special case for "app"
    if (name == 'app') prefix = '/';

    app.all('*', function (req, res, next) {
        if (req.monomi.browserType in {'tablet': '', 'touch': '', 'mobile': ''}) {
            global.isMobileDevice = true;
        }

        if (typeof(req.session) == 'undefined' || typeof(req.session.loggedIn) == 'undefined' || !req.session.loggedIn) {
            req.session.loggedIn = false;

            if (!req.url.match(/^\/js.*/) && req.url != '/' && !req.url.match(/\/authenticate.*/) && req.url != '/about' && !req.url.match(/\/templates.*/)) {
                res.writeHead(403);
                res.end();
                return;
            }
        }

        next();
    });

    Object.keys(actions).map(function (action) {
        var fn = controllerAction(name, action, actions[action]);

        if (prefix == '/' && action != 'index') prefix = '/app';

        switch(action) {
        case 'index':
            if (prefix != '/') {
                app.post(prefix, fn);
            } else {
                app.get(prefix, fn);
            }

            break;
        default:
            if (prefix == '/program' && action == 'view') {
                action = action + '/:channelid';
            }

            if (prefix == '/js' || prefix == '/templates') {
                console.log('Registering GET: ' + prefix + '/' + action);
                app.get(prefix + '/' + action, fn);
                break;
            }

            console.log('Registering POST: ' + prefix + '/' + action);
            app.post(prefix + '/' + action, fn);

            break;
        }
    });
}

// Proxy res.render() to add some magic

function controllerAction (name, action, fn) {
    return function (req, res, next) {
        var render = res.render,
        format = req.params.format,
        path = __dirname + '/views/' + name + '/' + action + '.html';

        res.render = function(obj, options, fn){
            res.render = render;
            // Template path
            if (typeof obj === 'string') {
                return res.render(obj, options, fn);
            }

            // Format support
            if (action == 'show' && format) {
                if (format === 'json') {
                    return res.send(obj);
                } else {
                    throw new Error('unsupported format "' + format + '"');
                }
            }

            // Render template
            res.render = render;
            options = options || {};
            // Expose obj as the "users" or "user" local
            if (action == 'index') {
                options[plural] = obj;
            } else {
                options[name] = obj;
            }

            return res.render(path, options, fn);
        };

        fn.apply(this, arguments);
    };
}