var NavigationCollection = {
    listener: {
        read: function (data, cb) {
            console.log(arguments);

            cb();
        }
    }
};

module.exports = NavigationCollection;