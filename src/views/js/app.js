var socket = io.connect();

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
            audio: [],
            subtitles: []
        }
        
        for (var i in data.components) {
            switch (data.components[i].description) {
            case 'stereo':
                components.audio.push({
                    language: data.components[i].lang,
                    type: 'stereo'
                });
                break;
            
            case 'Dolby Digital 2.0':
                components.audio.push('dd2');
                break;
                
            case 'DVB-Untertitel':
                components.subtitles.push(data.components[i].lang);
                break;
            
            case 'HD-Video':
                components.video = 'hd';
                break;
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

            if (loadSite.match(/^\/program\/view\/.*/)) {
                el = 'programlist';
            } else if (loadSite.match(/^\/program$/)) {
                $(document).attr('title', 'VDRManager // <%= __("Program") %>');
            } else if (loadSite.match(/^\/settings\/.*/)) {
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
});