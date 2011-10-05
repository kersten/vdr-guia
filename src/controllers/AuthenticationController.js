io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('User:login', function (data) {
        var UserModel = require('../dbmodels/UserModel');
        
        UserModel.count({user: data.username, password: data.password}, function (err, count) {
            var loggedIn = false;
            
            if (count != 0) {
                mongooseSessionStore.set(hs.sessionID, {loggedIn: true});
                loggedIn = true;
                hs.session.loggedIn = true;
                
                hs.session.touch().save();
            }
            
            socket.emit('User:login', {loggedIn: loggedIn});
        });
    });
    
    socket.on('User:logout', function () {
        mongooseSessionStore.destroy(hs.sessionID, function () {
            socket.emit('User:logout', {loggedIn: false});
        });
        
        hs.session.loggedIn = false;
                
        hs.session.touch().save();
    });
});