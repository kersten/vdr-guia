_.templateSettings = {
    evaluate    : /<&([\s\S]+?)&>/g,
    interpolate : /<&=([\s\S]+?)&>/g
};

Backbone.View.prototype.template = null;

var socket = io.connect(location.origin, {'connect timeout': 5000, 'max reconnection attempts': 500});

socket.on('disconnect', function () {
    $('#appDisconnected').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
    });
});

socket.on('reconnect', function () {
    $('#appDisconnected').modal('hide');
});

Backbone.sync = function (method, model, options) {
    var getUrl = function (object) {
        if (!(object && object.url)) return null;
        return _.isFunction(object.url) ? object.url() : object.url;
    };

    var cmd = getUrl(model).split('/'),
        namespace = cmd[0];

    var params = _.extend({
        req: namespace + ':' + method
    }, options.data, model.params);

    params.model = model.toJSON() || {};

    console.log(namespace + ':' + method);

    socket.emit(namespace + ':' + method, params, function (data) {
        if (data !== undefined && data.error !== undefined) {
            options.error(data);
        } else {
            if (data === undefined) {
                options.success();
            } else {
                options.success(data);
            }
        }
    });
};

Backbone.Model.prototype.idAttribute = "_id";

XDate.parsers.unshift(function (str) {
    var parts = str.split('.');
    if (parts.length == 3) {
        return new XDate(
            parseInt(parts[2], 10), // year
            parseInt(parts[1], 10) - 1, // month
            parseInt(parts[0], 10) // date
        );
    }

    return false;
});