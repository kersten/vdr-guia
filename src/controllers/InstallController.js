var net = require('net');
var ConfigurationModel = mongoose.model('Configuration');
var UserModel = mongoose.model('User');

io.sockets.on('connection', function (socket) {
    socket.on('ConfigurationModel:create', function (data) {
        data = data.model;

        var configuration = new ConfigurationModel({
            vdrHost: data.vdrhost,
            restfulPort: data.restfulport
        });

        var user = new UserModel({
            user: data.username,
            password: data.password,
            socializeKey: data.socializeKey,
            socialize: data.socialize
        });

        user.save();
        configuration.save();
    });

    socket.on('Install:checkrestful', function (data, callback) {
        rest.get('http://' + data.vdrhost + ':' + data.restfulport + '/info.json').on('success', function(data) {
            callback({reachable: true});
        }).on('error', function () {
            console.log('ERROR');
            callback({reachable: false});
        });
    });
    
    socket.on('Install:redirect', function (data, callback) {
        GUIA.setup();
        
        callback();
    });
});