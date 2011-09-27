var _ = require('underscore')._;
    Backbone = require('backbone');

function RawEventItemModel () { // @extends Backbone.Model
    return Backbone.Model.apply(this, arguments)
}

RawEventItemModel.prototype = Backbone.Model.prototype;

RawEventItemModel.__exports__ = ['hasTimer', 'timerActive'];

RawEventItemModel.prototype.initialize = function (event) {
    this.initDescription();
    
    if (this.get('details').length != 0) {
        this.initDetails();
    }

    this.unset('details');
};

RawEventItemModel.prototype.initDescription = function () {
    var desc = this.get('description');
    
    desc = desc.replace(/Show-Id: [0-9]+$/, '');
    
    var ratingRegex = /^\[([\*]*?)\](.*)/;
    var rating = null;

    if (ratingRegex.test(desc)) {
        var match = desc.match(ratingRegex);
        rating = match[1].length;
        desc = match[2];
    }
    
    desc = desc.replace(/^\s+|\s+$/g, '');
    
    this.set({rating: rating});
    this.set({description: desc})
};

RawEventItemModel.prototype.initDetails = function () {
    var self = this;
    this.get('details').forEach(function (obj) {
        switch (obj.key) {
        case 'YEAR':
            self.set({year: obj.value});
            break;

        case 'COUNTRY':
            self.set({country: obj.value});
            break;

        case 'SEQEUNCE':
            self.set({episode: obj.value});
            break;

        case 'REGISSEUR':
            self.set({regisseur: obj.value});
            break;

        case 'ACTORS':
            var actorsArr = obj.value.split(' - ');
            var actors = new Array();

            var characterRegEx = /(.*?)\s\((.*?)\)/;

            actorsArr.forEach(function (actor) {
                if (characterRegEx.test(actor)) {
                    var match = actor.match(characterRegEx);

                    actors.push({
                        name: match[1],
                        character: match[2]
                    });
                } else {
                    actors.push({
                        name: actor,
                        character: null
                    });
                }
            });

            self.set({actors: actors});
            break;
        }
    });
};

RawEventItemModel.prototype.hasTimer = function () {
    return this.event.timer_exists;
};

RawEventItemModel.prototype.timerActive = function () {
    return this.event.timer_active;
};

exports.init = RawEventItemModel;