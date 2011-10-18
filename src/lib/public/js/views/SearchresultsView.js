var SearchresultsView = Backbone.View.extend({
    url: "search/results",
    
    generateHTML: function (callback) {
        var self = this;
        
        var EventCollection = require('./EventCollection');
        var eventCollection = new EventCollection;
        eventCollection.url = 'SearchresultCollection';

        eventCollection.fetch({
            data: {
                page: this.page,
                term: this.query
            },

            success: function (collection) {
                var diff = $('#content').height() - $('#header_div').height();
                $('#searchresults').css('max-height', $(window).height() - $('#header_div').height());
                
                callback.apply(this, [_.template(self.template, {searchresults: collection})]);
            }
        });
    },
    
    render: function (callback) {
        if (this.template == null) {
            return this;
        }
        
        var self = this;

        this.generateHTML(function (res) {
            $('#searchresults').html(res);
            callback.call();
            Application.loadingOverlay('hide');
        });
    },
    
    renderTemplate: function (query, page, callback) {
        this.query = query,
        this.page = page;
        
        var self = this;
    
        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    self.template = res;
                    self.render(callback);
                }
            });
        } else {
            this.render(callback);
        }
    }
});