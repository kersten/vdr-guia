function YavdrNavigationController () {

}

EventEmitter.global.on('beforeroute', function(route, currentFragment) {
    if (!route.match(/^beforeroute:yaVdr/) && $('a.brand').data('view') == 'yaVDR') {
        $('.navbar-fixed-top ul.nav').fadeOut(function () {
            $('.navbar-fixed-top ul.nav > li').filter(function() { return $(this).css("display") != "none" }).remove();
            $('.navbar-fixed-top ul.nav').children().show();
            $('.navbar-fixed-top ul.nav').fadeIn();
        });

        $('a.brand').fadeOut(function () {
            $(this).html($.t('application.name')).fadeIn();
        });

        $('a.brand').data('view', '');
    }
});