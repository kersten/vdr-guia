io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('User:login', function (data, callback) {
        var UserSchema = require('../schemas/UserSchema');
        
        UserSchema.count({user: data.username, password: data.password}, function (err, count) {
            var loggedIn = false;
            
            if (count != 0) {
                mongooseSessionStore.set(hs.sessionID, {loggedIn: true});
                loggedIn = true;
                hs.session.loggedIn = true;
                
                hs.session.touch().save();
            }
            
            callback({loggedIn: loggedIn});
        });
    });
    
    socket.on('User:logout', function (data, callback) {
        mongooseSessionStore.destroy(hs.sessionID, function () {
            callback({loggedIn: false});
        });
        
        hs.session.loggedIn = false;
                
        hs.session.touch().save();
    });
});