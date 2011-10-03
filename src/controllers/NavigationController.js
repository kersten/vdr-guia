io.sockets.on('connection', function (socket) {
    var hs = socket.handshake;
    
    socket.on('NavigationModel:read', function () {
        console.log(hs.session.loggedIn);
    });
});