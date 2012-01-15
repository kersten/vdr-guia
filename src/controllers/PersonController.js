var actors = mongoose.model('Actor');

io.sockets.on('connection', function (socket) {
    socket.on('PersonModel:read', function (data, callback) {
        if (!socket.handshake.session.loggedIn) {
            return false;
        }

        console.log(data);

        var query = actors.findOne({_id: data._id});
        query.populate('tmdbId');

        query.run(function (err, doc) {
            callback(doc);
       })
    });
});