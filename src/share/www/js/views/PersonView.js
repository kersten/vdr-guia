var PersonView = Backbone.View.extend({
    template: 'PersonTemplate',

    render: function (callback) {
        var self = this;

        var person = new PersonModel();
        person.fetch({
            data: {
                _id: this.options._id
            }, success: function (data) {
                self.model = person;
                $(self.el).html(_.template( $('#' + self.template).html(), {person: self.model} ));
                callback(self.el);
            }
        });
    }
});