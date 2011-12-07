var TVGuideView = Backbone.View.extend({
    url: "tvguide",
    
    generateHTML: function (callback) {
        var self = this;
        this.tvguide = new TVGuideCollection();

        this.tvguide.fetch({data: {page: 1},success: function (collection) {
            console.log(collection);
            Application.loadingOverlay('hide');
        }});
    }
});