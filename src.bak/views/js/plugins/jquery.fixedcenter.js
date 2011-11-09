(function(){
    jQuery.fn.fixedCenter = function(){
        return this.each(function(){
            var element = jQuery(this), win = jQuery(window);
            centerElement();

            jQuery(window).bind('resize',function(){
                centerElement();
            });

            function centerElement(){
                var elementWidth, elementHeight, windowWidth, windowHeight, X2, Y2;
                elementWidth = element.outerWidth();
                elementHeight = element.outerHeight();
                windowWidth = win.width();
                windowHeight = win.height();
                X2 = (windowWidth/2 - elementWidth/2) + "px";
                Y2 = (windowHeight/2 - elementHeight/2) + "px";
                jQuery(element).css({
                    'left':X2,
                    'top':Y2,
                    'position':'fixed'
                });
            } //centerElement function
        });
    }
})();