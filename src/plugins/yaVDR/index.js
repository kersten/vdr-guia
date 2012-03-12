function YaVDR (app, express) {
    this.app = app;
    this.express = express;
}

YaVDR.prototype.init = function () {
    console.log(this.app);
};

module.exports = YaVDR;