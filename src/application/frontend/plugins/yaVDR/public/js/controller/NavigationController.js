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

    if ($('a.brand').data('view') != 'yaVDR' && currentFragment.match(/^\!\/yaVDR/)) {
        $('.navbar-fixed-top ul.nav').fadeOut(function () {
            $('.navbar-fixed-top ul.nav').children().hide();
            var items = [{
                "title": $.t("ns.plugin.yavdr:menu.system"),
                "icon": "calendar",
                "view": "yaVDR/System"
            }, {
                "title": $.t("ns.plugin.yavdr:menu.network"),
                "icon": "random",
                "view": "yaVDR/Network"
            }, {
                "title": $.t("ns.plugin.yavdr:menu.hardware"),
                "icon": "print",
                "view": "yaVDR/Hardware"
            }, {
                "title": $.t("ns.plugin.yavdr:menu.commands"),
                "icon": "list-alt",
                "view": "yaVDR/Commands"
            }, {
                "title": $.t("ns.plugin.yavdr:menu.tools"),
                "icon": "magnet",
                "view": "yaVDR/Tools"
            }, {
                "title": $.t("application.name"),
                "icon": "play-circle",
                "view": ""
            }];

            items.forEach(function (item) {
                var link = $('<a></a>').data('view', item.view).css({cursor: 'pointer'}).append(((item.icon) ? $('<i></i>').css({marginRight: '10px'}).addClass('icon-' + item.icon).addClass('icon-white') : '')).append(item.title)
                var el = $('<li></li>').html(link);
                $('.navbar-fixed-top ul.nav').append(el);
            });

            $('.navbar-fixed-top ul.nav').fadeIn();
        });

        $('a.brand').fadeOut(function () {
            $(this).html('yaVDR').fadeIn();
        });

        $('a.brand').data('view', 'yaVDR');
    }
});