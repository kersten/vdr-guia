io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('User:login', function (data) {
        var UserModel = require('../dbmodels/UserModel');
        
        UserModel.count({user: data.username, password: data.password}, function (err, count) {
            var loggedIn = false;
            
            if (count != 0) {
                console.log(hs.sessionID);
                mongooseSessionStore.set(hs.sessionID, {loggedIn: true});
                loggedIn = true;
                hs.session.loggedIn = true;
                
                hs.session.touch().save();
            }
            
            socket.emit('User:login', {loggedIn: loggedIn});
        });
    });
});