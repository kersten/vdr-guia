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
});