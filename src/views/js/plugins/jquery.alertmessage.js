(function( $ ){
    var el = null;
    var overlay = null;
    var dialogOptions = null;

    var methods = {
        init : function ( options ) {
            dialogOptions = options;

            overlay = $('<div></div>').css({
                position: 'fixed',
                top: 0,
                width: $(window).width(),
                height: $(window).height(),
                zIndex: 1000000
            });

            el = $(this).css({
                position: 'fixed',
                top: '50%',
                left: 'auto',
                margin: '0 auto',
                zIndex: 1000000,
                visibility: 'hidden'
            }).addClass('alert-message block-message');
            
            var cls = 'info';
            
            if (typeof(options.type) != 'undefined') {
                cls = options.type;
            }
            
            el.addClass(cls);
            
            if (typeof(options.close) != 'undefined' && options.close === true) {
                el.append($('<a></a>').addClass("close").html('×').click(
                    function () {
                        $(this).parent().parent().alertmessage('hide');
                    }
                ));
            }
            
            var p = $('<p></p>');
            
            if (typeof(options.text) != 'undefined') {
                p.html(options.text);
            }
            
            el.append(p);
            
            var actions = $('<div></div>').addClass('alert-actions');
            
            for (var i in options.buttons) {
                var cls = null;
                
                if (typeof(options.buttons[i].type) != 'undefined') {
                    cls = options.buttons[i].type;
                }
                
                var btn = $('<a></a>').addClass('btn small');

                if (cls != null) {
                    btn.addClass(cls);
                }
                
                 btn.html(options.buttons[i].text);

                if (options.buttons[i].action == 'close') {
                    btn.click(function () {
                        $(this).parent().parent().parent().alertmessage('hide');
                    });
                } else {
                    btn.click(options.buttons[i].action);
                }

                actions.append(btn);
            }
            
            el.append(actions);
            return this;
        },
        show : function ( ) {
            $('body').append($('<div></div>').append(overlay).append(el));

            $(this).css({display: 'none', visibility: 'visible'});

            $(this).fixedCenter();

            $(this).fadeIn("fast");
        },
        hide : function ( ) {
            $(this).fadeOut("fast", function () {
                $(this).remove();
                //overlay.remove();

                if (typeof(dialogOptions.onClose) != 'undefined') {
                    dialogOptions.onClose.call();
                }
            });
        }
    };

    $.fn.alertmessage = function( method ) {
        // Method calling logic
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
            return false;
        }
    };
})( jQuery );