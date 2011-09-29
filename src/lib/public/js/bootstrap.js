var $ = jQuery = require('jquery-browserify'),
    _ = require('underscore')._,
    Backbone = require('backbone-browserify');

var socket = io.connect();

Backbone.sync = function (method, model, options) {
    var getUrl = function (object) {
        if (!(object && object.url)) return null;
        return _.isFunction(object.url) ? object.url() : object.url;
    };

    var cmd = getUrl(model).split('/'),
        namespace = cmd[0];

    var params = _.extend({
        req: namespace + ':' + method
    }, options);

    params.data = model.toJSON() || {};

    console.log('Emit: ' + namespace + ':' + method);
    socket.emit(namespace + ':' + method, params.data, function (data) {
        options.success(data);
    });
};