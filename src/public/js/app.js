jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop() + "px");
    this.css("left", (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft() + "px");
    return this;
};

var overlay = {
    el: null,
    show: function () {
        this.el = $('<div></div>').css({
            opacity: 0.5,
            backgroundColor: '#CCCCCC',
            position: 'absolute',
            top: '0px',
            width: $(window).width(),
            height: $(window).height(),
            zIndex: 100000
        });

        $(this.el).append($('<div></div>').center().css('left', '-=100').html('<img src="/img/loading.gif" />'));

        $('body').append(this.el);
    },
    hide: function () {
        $(this.el).remove();
    }
};