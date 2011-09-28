var _ = require('underscore')._,
    Backbone = require('backbone');

var RawEventModel = Backbone.Model.extend({
    url: 'Event',
    
    defaults: {
        id: null,
        title: null,
        short_description: null,
        description: null,
        start_time: null,
        duration: null,
        images: null,
        rating: null,
        year: null
    },
    
    initialize: function () {
        this.initDescription();

        if (typeof(this.get('details')) != 'undefined' && this.get('details').length != 0) {
            this.initDetails();
        }

        this.unset('details');
    },
    initDescription: function () {
        var desc = this.get('description');

        if (typeof(desc) != 'undefined') {
            desc = desc.replace(/Show-Id: [0-9]+$/, '');

            var ratingRegex = /^\[([\*]*?)\](.*)/;
            var rating = null;

            if (ratingRegex.test(desc)) {
                var match = desc.match(ratingRegex);
                rating = match[1].length;
                desc = match[2];
            }

            desc = desc.replace(/^\s+|\s+$/g, '');
        }

        this.set({rating: rating});
        this.set({description: desc})
    },
    initDetails: function () {
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
                var regisseurs = obj.value.split('\n');
                self.set({regisseur: regisseurs});
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
    },
    hasTimer: function () {
        return this.event.timer_exists;
    },
    timerActive: function () {
        return this.event.timer_active;
    }
});

/*RawEventItemModel.prototype.updateDb = function () {
    db.get('SELECT id FROM channel WHERE id = ?', id, function (err, row) {
        if (typeof(row) != 'undefined') {
            db.run("INSERT INTO event VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                event.id,
                event.title,
                event.short_description,
                event.description,
                event.start_time,
                event.duration,
                event.images,
                event.rating,
                event.year
            ], function (err, row) {
                console.log('Last inserted :: ' + this.lastID);

                db.run('INSERT INTO event2channel VALUES (?, ?)', [this.lastID, id]);
                
                if (event.details.length != "undefined")

                callback.call();
            });
        } else {
            callback.call();
        }
    });
};*/

module.exports = RawEventModel;