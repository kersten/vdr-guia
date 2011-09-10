var socket = io.connect();

$(document).ready(function () {
    $('body').overlay('show');
    
    checkLogin();
    
    $(window).bind('hashchange', function (e) {
        $('body').overlay('show');
        
        var view = (location.hash == "") ? 'about' : location.hash.substring(1);
        view = view.charAt(0).toUpperCase() + view.substring(1);
        
        console.log('Call get' + view + '();');
        
        eval('get' + view + '()');
    });
    
    function checkLogin () {
        socket.emit('checksession');
        
        removeContext($('#body'));
        
        var cb = function (data) {
            if (data.loggedIn === false) {
                $('#LoginTemplate').tmpl().appendTo('#body');
                
                $('#login_btn').click(function () {
                    $('body').overlay('show');

                    socket.emit('login', {
                        username: $('#username').val(),
                        password: $('#password').val()
                    });

                    return false;
                });
                
                $('body').overlay('hide');
            } else {
                getMenu();
                getAbout();
                
                $('body').overlay('hide');
            }
            
            socket.removeListener('loggedIn', cb);
        };
        
        socket.on('loggedIn', cb);

        socket.on('login.done', function (data) {
            if (data.successful) {
                getMenu();
                getAbout();
                
                $('body').overlay('hide');
                
                /*$.ajax({
                    type: 'POST',
                    url: '/menu',
                    success: function (res) {
                        $('#menu').html('<h3><a href="#">VDRManager</a></h3>');
                        $('#menu').append(res);
                    }
                });

                load();*/
            } else {
                $('body').overlay('hide');

                if ($('#login_failed').length != 0) {
                    $('#login_failed').remove();
                }

                $('#login_actions').before('<div class="alert-message error" id="login_failed"><p><strong><%= __("An error occurred:") %></strong> <%= __("Username or password is wrong") %></p></div>');
            }
        });
    }
    
    function getMenu () {
        socket.emit('menu');
        
        var menu = function (data) {
            $('div#menu > ul > li').remove();
            $('#MainMenuTemplate').tmpl(data).appendTo('div#menu > ul');
            
            socket.removeListener('menu', menu);
        };
        
        socket.on('menu', menu);
    }
    
    function getTimeline () {
        removeContext($('#body'));
        
        $('body').overlay('hide');
    }
    
    function getTvguide () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("TV Guide") %>');
        
        $('#TvguideTemplate').tmpl().appendTo('#body');
        
        $('body').overlay('hide');
    }
    
    function getProgram () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Program") %>');
        
        $('body').overlay('hide');
    }
    
    function getTimer () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Timer") %>');
        
        $('body').overlay('hide');
    }
    
    function getSearch () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Search") %>');
        
        $('body').overlay('hide');
    }
    
    function getSearchtimer () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Searchtimer") %>');
        
        $('body').overlay('hide');
    }
    
    function getRecordings () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Recordings") %>');
        
        $('body').overlay('hide');
    }
    
    function getSettings () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("Settings") %>');
        
        $('body').overlay('hide');
    }
    
    function getAbout () {
        removeContext($('#body'));
        
        $(document).attr('title', 'VDRManager // <%= __("About") %>');
        
        $('#AboutTemplate').tmpl().appendTo('#body');
        
        $('body').overlay('hide');
    }
    
    function getLogout () {
        removeContext($('#body'));
        
    }
    
    function removeContext( item ) {
        item.children().remove();
    }
});

/*
var createSearchtimer = function () {
    $().dialog({
        title: 'Create a new searchtimer',
        body: '<h3>Test</h3>',
        close: true,
        buttons: [{
            text: 'Create',
            action: function () {
                console.log('Create timer')
            }
        }, {
            text: 'Cancel',
            action: 'close'
        }]
    });
    
    $().dialog('show');
};

var showDetails = function (details) {
    socket.emit('getDetails', details);
    
    var cb = function (data) {
        var data = data.events[0];
        var components = {
            video: null,
            format: null,
            audio: [],
            subtitles: []
        }
        
        for (var i in data.components) {
            switch (data.components[i].description) {
            case 'stereo':
            case 'stereo deutsch':
            case 'stereo englisch':
                components.audio.push({
                    language: data.components[i].lang,
                    type: 'stereo'
                });
                break;
            
            case 'Dolby Digital 2.0':
                components.audio.push({
                    language: data.components[i].lang,
                    type: 'dd2'
                });
                break;
                
            case 'DVB-Untertitel':
                components.subtitles.push(data.components[i].lang);
                break;
            
            case 'HD-Video':
                components.video = 'hd';
                break;
                
            case '16:9':
                components.format = '16:9';
            }
        }
        
        $().dialog({
            title: data.title,
            subtitle: data.short_text,
            components: components,
            body: '<p>' + data.description + '</p>',
            close: true,
            buttons: [{
                text: 'Ok',
                action: 'close'
            }]
        });

        $().dialog('show');
        
        console.log(data);
        
        socket.removeListener('getDetails', cb);
    };
    
    socket.on('getDetails', cb);
};

var load = function () {
    $('body').overlay('show');

    var loadSite = (location.hash == "") ? '/app/frontsite' : '/' + location.hash.substring(1);

    $.ajax({
        type: 'POST',
        url: loadSite,
        success: function (res) {
            $('body').overlay('hide');

            var el = 'body';

            if (loadSite.match(/^\/program\/view\/.*//*)) {
                el = 'programlist';
            } else if (loadSite.match(/^\/program$/)) {
                $(document).attr('title', 'VDRManager // <%= __("Program") %>');
            } else if (loadSite.match(/^\/settings\/.*//*)) {
                el = 'tab_content';
            }

            $('#' + el).html(res);

            if (loadSite.match(/^\/settings/)) {
                $('#settings > .tabs li').click(function () {
                    $('#settings > .tabs li').removeClass('active');
                    $(this).addClass('active');
                });
            } else if (loadSite.match(/^\/program$/)) {
                $('#channellist').css('height', $(document).height() - $('#channellist').offset().top);
            }
        }
    });
};

$(document).ready(function () {
    $('body').overlay('show');

    $(window).bind('hashchange', function (e) {
        load();
    });

    socket.on('logout', function (data) {
        $('body').overlay('show');

        $.ajax({
            type: 'POST',
            url: '/authenticate',
            success: function (res) {
                $('#body').html(res);
                $('body').overlay('hide');

                $(this).attr('title', 'VDRManager // <%= __("Login") %>');

                $('#login').click(function () {
                    $('body').overlay('show');

                    socket.emit('login', {
                        username: $('#username').val(),
                        password: $('#password').val()
                    });

                    return false;
                });
            }
        });
    });

    socket.emit('checksession');

    socket.on('loggedIn', function (data) {
        if (data.loggedIn === false) {
            $.ajax({
                type: 'POST',
                url: '/authenticate',
                success: function (res) {
                    $('#body').html(res);
                    $('body').overlay('hide');

                    $(this).attr('title', 'VDRManager // <%= __("Login") %>');

                    $('#login').click(function () {
                        $('body').overlay('show');

                        socket.emit('login', {
                            username: $('#username').val(),
                            password: $('#password').val()
                        });

                        return false;
                    });
                }
            });
        } else {
            $.ajax({
                type: 'POST',
                url: '/menu',
                success: function (res) {
                    $('#menu').html('<h3><a href="#">VDRManager</a></h3>');
                    $('#menu').append(res);
                }
            });

            load();
        }
    });

    socket.on('login.done', function (data){
        console.log(data);

        if (data.successful) {
            $.ajax({
                type: 'POST',
                url: '/menu',
                success: function (res) {
                    $('#menu').html('<h3><a href="#">VDRManager</a></h3>');
                    $('#menu').append(res);
                }
            });

            load();
        } else {
            $('body').overlay('hide');

            if ($('#login_failed').length != 0) {
                $('#login_failed').remove();
            }

            $('#login_actions').before('<div class="alert-message error" id="login_failed"><p><strong><%= __("An error occurred:") %></strong> <%= __("Username or password is wrong") %></p></div>');
        }
    });
}); */