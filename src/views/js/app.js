var socket = io.connect();

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
            } else if (loadSite.match(/^\/settings\/.*/)) {
                el = 'tab_content';
            }

            $('#' + el).html(res);

            if (loadSite.match(/^\/settings/)) {
                $('#settings > .tabs li').click(function () {
                    $('#settings > .tabs li').removeClass('active');
                    $(this).addClass('active');
                });
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