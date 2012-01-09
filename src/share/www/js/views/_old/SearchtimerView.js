var SearchtimerView = Backbone.View.extend({
    url: "searchtimer",
    
    openDialog: function () {
        this.renderTemplate(function () {
            Application.overlay('show', function () {
                $('.pills').tabs().bind('change', function (event) {
                    $('.' + $(event.relatedTarget).attr('href').substr(1)).slideUp(function () {
                        $('.' + $(event.target).attr('href').substr(1)).slideDown();
                    });
                });
                
                $('#createNewSearchtimerDialog').modal('show').bind('hide', function () {
                    Application.overlay('hide');
                });

                $('#createNewSearchtimerDialog > .modal-body').css({
                    maxHeight: $(window).height() - 40 - 97 - ($('#createNewSearchtimerDialog > .modal-header').outerHeight() + $('#createNewSearchtimerDialog > .modal-footer').outerHeight())
                });

                $('#newSearchtimerSearchField').val($('#searchinputfield').val());

                $('#btnCreateNewSearchtimer').unbind();
                $('#btnCreateNewSearchtimer').click(function () {
                    console.log('CREATE');
                });

                $('#btnCancelNewSearchtimer').unbind();
                $('#btnCancelNewSearchtimer').click(function () {
                    $('#createNewSearchtimerDialog').modal('hide');
                });
            });
        });
    },
    
    renderTemplate: function (callback) {
        var self = this;
        
        if (this.template == null) {
            $.ajax({
                url: "/templates/" + self.url,
                success: function (res) {
                    $('body').append(res);
                    callback.call();
                }
            });
        } else {
            callback.call();
        }
    }
});