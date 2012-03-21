var WelcomeView = Backbone.View.extend({
    template: 'BaseWelcomeTemplate',

    render: function () {
        $(this.el).html(_.template( $('#' + this.template).html(), {} ));

        var cloudCollection = new EventCollection();
        cloudCollection.url = 'EventCollection:cloud';

        cloudCollection.fetch({success: function (col, elements) {
            elements.forEach(function (tag) {
                $('#tags > ul', this.el).append('<li><a href="" onclick="Backbone.history.navigate(\'!/Channels\')">' + tag + '</a></li>');
            });

            $('#epgCloud', this.el).tagcanvas({
                textColour: '#ff0000',
                outlineColour: '#ff00ff',
                reverse: true,
                depth: 0.8,
                maxSpeed: 0.05,
                initial: [0.3,-0.3]
            },$('#tags', this.el));
        }});

        return this;
    }
});