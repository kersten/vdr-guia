var net = require('net');

io.sockets.on('connection', function (socket) {
    socket.on('ConfigurationModel:create', function (data) {
        var ConfigurationModel = require('../dbmodels/ConfigurationModel');
        var UserModel = require('../dbmodels/UserModel');
        
        var configuration = new ConfigurationModel({
            socalizeKey: data.socalizeKey,
            socalize: data.socalize,
            vdrHost: data.vdrhost,
            restfulPort: data.restfulport
        });
        
        var user = new UserModel({
            user: data.username,
            password: data.password
        });
        
        user.save();
        
        configuration.save();
    });
    
    socket.on('Install:checkrestful', function (data) {
        rest.get('http://' + data.vdrhost + ':' + data.restfulport + '/info.json').on('success', function(data) {
            socket.emit('Install:checkrestful', {rechable: true});
            clearTimeout(checkReachable);
        }).on('error', function () {
            console.log('ERROR');
            socket.emit('Install:checkrestful', {rechable: false});
            clearTimeout(checkReachable);
        });
        
        var checkReachable = setTimeout(function () {
            socket.emit('Install:checkrestful', {rechable: false});
        }, 2000);
    });
});