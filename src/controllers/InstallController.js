io.sockets.on('connection', function (socket) {
    socket.on('ConfigurationModel:create', function (data) {
        var ConfigurationModel = require('../dbmodels/ConfigurationModel');
        var configuration = new ConfigurationModel({
            user: data.username,
            password: data.password,
            socalizeKey: data.socalizeKey,
            socalize: data.socalize
        });
        
        configuration.save(function(err, user_Saved){
            if(err){
                throw err;
                console.log(err);
            }else{
                console.log('saved!');
            }
        });
    });
});