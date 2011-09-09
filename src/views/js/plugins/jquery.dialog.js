(function( $ ){
    var el = null;
    
    var methods = {
        init : function ( options ) {
            el = $('<div></div>').css({
                position: 'fixed',
                top: 'auto',
                left: 'auto',
                margin: '0 auto',
                zIndex: 1000000,
                display: 'none'
            }).addClass('modal');
            
            var header = $('<div></div>').addClass('modal-header');
            var title = $('<h3></h3>').html(options.title);
            
            if (typeof(options.subtitle) != 'undefined') {
                var subtitle = $('<small></small>').html(options.subtitle);
                title.append('&nbsp;', subtitle);
            }
            
            header.append(title);
            
            if (typeof(options.close) != 'undefined' && options.close === true) {
                header.append($('<a></a>').addClass("close").html('×').click(
                    function () {
                        methods.hide();
                    }
                ));
            }
            
            if (typeof(options.components) != 'undefined') {
                var components = $('<div></div>').css({
                    paddingLeft: '20px'
                });
            }
            
            var body = $('<div></div>').addClass('modal-body').html(options.body)
            var footer = $('<div></div>').addClass('modal-footer');
            
            for (var i in options.buttons) {
                var cls = 'secondary';
                
                if (i == 0) {
                    cls = 'primary';
                }
                
                var btn = $('<a></a>').addClass('btn ' + cls);
                btn.html(options.buttons[i].text);
                
                if (options.buttons[i].action == 'close') {
                    btn.click(function () {
                        methods.hide();
                    });
                } else {
                    btn.click(options.buttons[i].action);
                }
                
                footer.append(btn);
            }
            
            el.append(header);
            
            if (typeof(options.components) != 'undefined') {
                el.append(components);
            }
            
            el.append(body, footer);
            
            console.log(el.outerHeight() / 2);
        },
        show : function ( ) {
            $('body').append(el);
            
            el.center().css({
                'position': 'fixed'
            });
            
            el.fadeIn("fast");
        },
        hide : function ( ) {
            el.fadeOut("fast", function () {
                el.remove();
            });
        }
    };
    
    $.fn.dialog = function( method ) {
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