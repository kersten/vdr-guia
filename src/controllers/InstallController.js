var ConfigurationModel = mongoose.model('Configuration');
var UserModel = mongoose.model('User');



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

        if (data.socialize) {
            var user = new UserModel({
                user: data.username,
                password: data.password,
                email: data.email,
                salt: data.salt,
                socializeKey: data.uuid,
                socialize: data.socialize
            });

            user.save(function () {
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
        data = data.model;
        
        Dnode.connect('guia-server.yavdr.tv', 7007, function (remote, connection) {
            log.inf('Try to register user on GUIA server');
            
            remote.register(data.username, data.password, data.email, function (registrationData) {
                callback(registrationData);
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