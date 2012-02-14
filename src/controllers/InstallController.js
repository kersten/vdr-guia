var ConfigurationModel = mongoose.model('Configuration');
var UserModel = mongoose.model('User');
var async = require('async');

io.sockets.on('connection', function (socket) {
    socket.on('ConfigurationModel:create', function (data, callback) {
        console.log(arguments);
        
        data = data.model;

        var configuration = new ConfigurationModel({
            vdrHost: data.vdrhost,
            restfulPort: data.restfulport,
            epgscandelay: 1,
            fetchTmdbMovies: true,
            fetchTmdbActors: true,
            fetchThetvdbSeasons: true
        });

        if (socket.handshake.session.uuid !== undefined) {
            configuration.set({socializeKey: socket.handshake.session.uuid});
            
            var user = new UserModel({
                user: socket.handshake.session.username,
                password: socket.handshake.session.password,
                email: socket.handshake.session.email,
                socialize: true
            });

            user.save(function () {
                delete(socket.handshake.session.username);
                delete(socket.handshake.session.password);
                delete(socket.handshake.session.email);
                delete(socket.handshake.session.uuid);
                
                callback();
            });
        } else {
            var user = new UserModel({
                user: data.username,
                password: data.password,
                socialize: false
            });

            user.save();
            
            callback();
        }
        
        configuration.save();
    });
    
    socket.on('Install:CheckUser', function (data, callback) {
        //data = data.model;
        
        var uuid = null;
        
        Dnode.connect('guia-server.yavdr.tv', 7007, function (remote, connection) {
            async.series([
                function (callback) {
                    log.inf('Try to register VDR on GUIA server');
                    
                    remote.registerVdr(function (data) {
                        socket.handshake.session.uuid = data.uuid;
                        socket.handshake.session.touch().save();
                        
                        callback(null);
                    });
                }, function (callback) {
                    if (data.existingAccount !== undefined && data.existingAccount === true) {
                        log.inf('Try to authenticate user on GUIA server');
                        
                        remote.authenticateUser(data.username, data.password, function (remote, user) {
                            if (user) {
                                socket.handshake.session.username = data.username;
                                socket.handshake.session.password = data.password;
                                socket.handshake.session.email = user.email;
                                socket.handshake.session.touch().save();
                                
                                callback(null);
                            } else {
                                callback('err');
                            }
                        });
                    } else {
                        log.inf('Try to register user on GUIA server');
                        
                        remote.registerUser(data.username, data.password, data.email, function () {
                            socket.handshake.session.username = data.username;
                            socket.handshake.session.password = data.password;
                            socket.handshake.session.email = data.email;
                            socket.handshake.session.touch().save();
                            
                            callback({success: true});
                        });
                    }
                }
            ], function (err) {
                if (err) {
                    
                } else {
                    callback({success: true});
                }
            });
        });
    });

    socket.on('Install:checkrestful', function (data, callback) {
        var sendFalse = setTimeout(function () {
            callback({reachable: false});
        }, 10000);

        rest.get('http://' + data.vdrhost + ':' + data.restfulport + '/info.json').on('success', function(data) {
            clearTimeout(sendFalse);
            callback({reachable: true});
        }).on('error', function () {
            clearTimeout(sendFalse);
            callback({reachable: false});
        });
    });

    socket.on('Install:redirect', function (data, callback) {
        GUIA.setup(function () {
            callback();
        });
    });
});