/**
 * Module dependencies.
 */

var fs = require('fs'),
    express = require('express'),
    syslog = require('node-syslog'),
    i18n = require("i18n"),
    config = require('./etc/config'),
    monomi = require("monomi"),
    rest = require('restler');

exports.boot = function (app){
  bootApplication(app);
  bootControllers(app);
};

// App settings and middleware

function bootApplication (app) {
    var RedisStore = require('connect-redis')(express);
    app.use(express.bodyParser());
    app.use(monomi.detectBrowserType());
    app.use(express.cookieParser());
    app.use(express.session({secret: config.redis.secret, store: new RedisStore}));
    
    app.use(express.logger());

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

    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
    
    app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
    
    global.ksort = require('./lib/ksort');
    global.rest = rest;
    global.restfulUrl = 'http://' + config.vdr.host + ':' + config.vdr.restfulport;
    global.config = config;
    global.vdr = {
        plugins: {}
    };
    
    rest.get(restfulUrl + '/info.json').on('complete', function(data) {
        for (var i in data.vdr.plugins) {
            if (data.vdr.plugins[i].name == 'epgsearch') {
                vdr.plugins.epgsearch = true;
            }
        }
    });

    // Some dynamic view helpers
    app.dynamicHelpers({
        request: function(req){
            return req;
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

            if (req.url != '/' && req.url != '/login' && req.url != '/login/submit') {
                res.writeHead(403);
                res.end();
                return;
            }
        }

        next();
    });

    Object.keys(actions).map(function (action) {
        var fn = controllerAction(name, action, actions[action]);

        switch(action) {
            case 'index':
                if (prefix != '/') {
                    app.post(prefix, fn);
                } else {
                    app.get(prefix, fn);
                }
                
                break;
            default:
                console.log('Register post: ' + prefix + '/' + action);
                app.post(prefix, fn);
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