var PersonModel = Backbone.Model.extend({
    url: 'PersonModel',

    getProfilePicture: function () {
        var picture = null;

        if (this.get('tmdbId').profile !== undefined) {
            this.get('tmdbId').profile.forEach(function (image) {
                if (image.image.size == 'profile') {
                    picture = image.image.url;
                    return;
                }
            });
        }

        if (picture == null) {
            picture = 'http://placehold.it/185x287?text=No+Picture'
        }

        return picture;
    }
});