var socket = io.connect();

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
};

var overlay = {
    el: null,
    show: function () {
        var el = this.el = $('<div></div>').css({
            opacity: 0.5,
            backgroundColor: '#CCCCCC',
            position: 'fixed',
            top: '0px',
            width: $(window).width(),
            height: $(window).height(),
            zIndex: 100000
        });

        $(this.el).append($('<div></div>').center().css('left', '-=100').html('<img src="/img/loading.gif" />'));
        $(window).scroll(function (e) {
            $(el).css('top', $(window).scrollTop());
        });
        $('body').append(this.el);
    },
    hide: function () {
        $(window).unbind('scroll');
        $(this.el).remove();
    }
};

$(document).ready(function () {
    overlay.show();
    
    socket.emit('checksession');

    socket.on('loggedIn', function (data) {
        if (data.loggedIn === false) {
            $.ajax({
                type: 'POST',
                url: '/authenticate',
                success: function (res) {
                    $('#body').html(res);
                    overlay.hide();
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

            $.ajax({
                type: 'POST',
                url: '/app/frontsite',
                success: function (res) {
                    $('#body').html(res);
                    overlay.hide();
                }
            });
        }
    });
    
    $(window).bind('hashchange', function (e) {
        console.log(location.hash);
    });
});