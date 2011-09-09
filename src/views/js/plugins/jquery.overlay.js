(function( $ ){
    $.fn.center = function () {
        this.css("position","absolute");
        this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
        this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
        return this;
    };

    $.fn.overlay = function( type ) {
        if (type == 'show') {
            if ($('#vdrmanager_overlay_loading').length == 0) {
                var el = $('<div></div>').css({
                    position: 'fixed',
                    top: '0px',
                    width: $(window).width(),
                    height: $(window).height(),
                    zIndex: 100000
                }).attr('id', 'vdrmanager_overlay_loading');

                $(el).append($('<div></div>').center().css({
                    backgroundColor: '#FFFFFF',
                    position: 'fixed',
                    left: '-=150',
                    width: 300,
                    height: 50,
                    zIndex: 100000,
                    borderColor: 'rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px 4px 4px 4px',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    boxShadow: '0 1px 0 rgba(255, 255, 255, 0.25) inset'
                }).html($('<div></div>').css({position: 'absolute', top: 15, left: 40}).html('<img src="/img/loading.gif" />')));

                this.append(el);
            }
        } else {
            $('#vdrmanager_overlay_loading').remove();
        }
    };
})( jQuery );