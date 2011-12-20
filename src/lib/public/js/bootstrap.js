_.templateSettings = {
    evaluate    : /<&([\s\S]+?)&>/g,
    interpolate : /<&=([\s\S]+?)&>/g
};

Backbone.View.prototype.template = null;

Backbone.View.prototype.generateHTML = function (callback) {
    callback.apply(this, [_.template(this.template, {})]);
};

Backbone.View.prototype.render = function () {
    var self = this;

    if (this.template == null) {
        return this;
    }

    this.generateHTML(function (res) {
        self.el.html(res);
        $(document).attr('title', $('#header_div').attr('title'));

        Application.loadingOverlay('hide');

        if (typeof(self.postRender) == 'function') {
            self.postRender();
        }
    });

    return this;
};

Backbone.View.prototype.renderTemplate = function () {
    if (typeof(this.url) == 'undefined') {
        return this;
    }

    var self = this;

    if (this.template == null) {
        $.ajax({
            url: "/templates/" + self.url,
            success: function (res) {
                self.template = res;
                self.render();
            }
        });
    } else {
        this.render();
    }
};

Backbone.View.prototype.destructor = function () {
    $(this.el).children().remove();
    $(this.el).unbind();
}

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

    params.model = model.toJSON() || {};

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