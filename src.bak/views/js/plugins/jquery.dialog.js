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
            }).addClass('modal');
            
            if (typeof(options.position) != 'undefined') {
                switch (options.position) {
                case 'rightbottom':
                    el.css({
                        right: 5,
                        bottom: 5
                    });
                    break;
                }
            }  

            var header = $('<div></div>').addClass('modal-header');
            var title = $('<h3></h3>').html(options.title);

            header.append(title);

            if (typeof(options.subtitle) != 'undefined') {
                var subtitle = $('<small></small>').html(options.subtitle);
                header.append(subtitle);
            }

            if (typeof(options.components) != 'undefined' && options.components.rating != null) {
                var stars = options.components.rating.split('*').length - 1;

                var starRating = $('<div></div>');

                for (var i = 1; i < 6; i++) {
                    if (i <= stars) {
                        starRating.append($('<img></img>').attr('src', '/img/stars/rating_05.gif').css({height: 16, marginRight: 5}));
                    } else {
                        starRating.append($('<img></img>').attr('src', '/img/stars/rating_14.gif').css({height: 16, marginRight: 5}));
                    }
                }

                header.append(starRating);
            }

            if (typeof(options.close) != 'undefined' && options.close === true) {
                header.append($('<a></a>').addClass("close").html('×').click(
                    function () {
                        $(this).parent().parent().parent().dialog('hide');
                    }
                ));
            }

            var body = $('<div></div>').addClass('modal-body').html(options.body);

            if (typeof(options.components) != 'undefined') {
                body.css('padding-top', 15);

                var components = $('<div></div>').css({
                    paddingLeft: 20,
                    paddingTop: 5
                });

                if (options.components.video != null) {
                    var img = null;

                    switch (options.components.video) {
                    case 'hd':
                        img = 'HD-TV_Logo.png';
                        break;

                    }

                    components.append($('<img></img>').attr('src', '/img/logos/' + img).css({height: 20, marginRight: 5}));
                }

                if (options.components.format != null) {
                    var img = null;

                    switch (options.components.format) {
                    case '16:9':
                        img = '16-9-Logo.png';
                        break;

                    }

                    components.append($('<img></img>').attr('src', '/img/logos/' + img).css({height: 20, marginRight: 5}));
                }

                if (options.components.audio.length != 0) {
                    var img = null;

                    for (var i in options.components.audio) {
                        switch (options.components.audio[i].type) {
                        case 'dd2':
                            img = 'Dolby-Digital-Logo.png';
                            break;

                        case 'stereo':
                            img = 'Dolby_Stereo_Logo.png';
                            break;
                        }

                        if (img != null)
                            components.append($('<img></img>').attr('src', '/img/logos/' + img).css({height: 20, marginRight: 5}));
                    }
                }

                if (options.components.subtitles.length != 0) {
                    var img = null;

                    for (var i in options.components.subtitles) {
                        switch (options.components.subtitles[i]) {
                        case 'de':
                        case 'deu':
                            img = 'Gehoerlos.jpg';
                            break;

                        case 'en':
                            img = 'Gehoerlos.jpg';
                            break;
                        }

                        if (img != null)
                            components.append($('<img></img>').attr('src', '/img/logos/' + img).css({height: 20, marginRight: 5}));
                    }
                }
            }

            var footer = $('<div></div>').addClass('modal-footer');

            if (typeof(options.components) != 'undefined' && options.components.ageRating != null) {
                var img = 'FSK-' + options.components.ageRating + 'J-KNZ-Print-1200-4c.jpg';

                components.append($('<img></img>').attr('src', '/img/logos/' + img).css({
                    height: 80,
                    marginRight: 5,
                    position: 'absolute',
                    left: 5,
                    bottom: 5
                }));
            }

            for (var i in options.buttons) {
                var cls = 'secondary';

                if (i == 0) {
                    cls = 'primary';
                }

                if (typeof(options.buttons[i].layout) != 'undefined') {
                    cls = options.buttons[i].layout;
                }

                var btn = $('<a></a>').addClass('btn ' + cls);
                btn.html(options.buttons[i].text);

                if (options.buttons[i].action == 'close') {
                    btn.click(function () {
                        $(this).parent().parent().parent().dialog('hide');
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
            return this;
        },
        show : function ( ) {
            $('body').append($('<div></div>').append(overlay).append(el));
            //$('body').append(overlay);
            //$('body').append(el);

            if ($(this).outerHeight(true) > $(window).height() - 50) {
                $(this).children('.modal-body').css({
                    maxHeight: $(window).height() - 150 - el.children().outerHeight(true),
                    overflow: 'auto'
                });
            }

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