var socket = io.connect();

$(document).ready(function () {
    $('body').overlay('show');

    var loadHash = function () {
        $('body').overlay('show');

        var view = (location.hash == "") ? 'about' : location.hash.substring(1);
        view = view.charAt(0).toUpperCase() + view.substring(1);

        eval('get' + view + '()');
    };

    checkLogin();

    $(window).bind('hashchange', function (e) {
        loadHash();
    });

    function checkLogin () {
        removeContext($('#body'));

        socket.emit('checksession');

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
                loadHash();
            }

            socket.removeListener('loggedIn', cb);
        };

        socket.on('loggedIn', cb);

        socket.on('login.done', function (data) {
            if (data.successful) {
                getMenu();
                getAbout();

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

    function getHighlights () {
        removeContext($('#body'));

        $(document).attr('title', 'VDRManager // <%= __("Highlights") %>');

        $('#HighlightsTemplate').tmpl().appendTo('#body');

        $('body').overlay('hide');
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

        var getChannels = function (channels) {
            $('#ProgramTemplate').tmpl({
                channels: channels
            }).appendTo('#body');

            $('#channellist').css('height', $(window).height() - $('#channellist').offset().top);

            $('div#channellist > table > tbody > tr').click(function () {
                $('body').overlay('show');
                getEpg($(this).attr('channelid'));
            });

            $('body').overlay('hide');

            socket.removeListener('getChannels', getChannels);
        };

        socket.on('getChannels', getChannels);

        socket.emit('getChannels');
    }

    function getEpg (channelId) {
        removeContext($('#epglist'));

        var getEpg = function (epg) {
            $('#EpgTableTemplate').tmpl().appendTo('#epglist');
            $('#EpgEntryTemplate').tmpl({epg: epg.channelEpg}).appendTo('#epglist > table > tbody');

            // Clean evantually binded old events
            $('div#epglist > table > tbody > tr > td:nth-child(4)').die('click');
            $('div#epglist > table > tbody > tr > td:nth-child(1)').die('click');

            // Bind ne events
            $('div#epglist > table > tbody > tr > td:nth-child(1)').live('click', function () {
                showDetails();
                createTimer(data.title + ((data.short_text != "") ? ' - ' + data.short_text : ''), channelId, data.start_time, data.start_time + data.duration);
            });

            $('div#epglist > table > tbody > tr > td:nth-child(4)').live('click', function () {
                showDetails(channelId, $(this).attr('eventid'));
            });

            //$('#epglist').css('height', $(window).height() - $('#epglist').offset().top);

            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    var getEpgNext = function (epg) {
                        if (epg.channelEpg.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }

                        $('#EpgEntryTemplate').tmpl({epg: epg.channelEpg}).appendTo('#epglist > table > tbody');

                        $('body').overlay('hide');

                        socket.removeListener('getEpg', getEpgNext);
                    };

                    socket.on('getEpg', getEpgNext);

                    socket.emit('getEpg', {
                        site: p,
                        channelid: channelId
                    });
                }
            });

            var message = $( "#channellist" );
            var originalMessageTop = message.offset().top;
            var view = $( window );

            view.bind("scroll resize", function () {
                var viewTop = view.scrollTop();

                if ((viewTop + 40 > originalMessageTop) && message.css('position') != 'fixed') {
                    // Toggle the message classes.
                    message.css({position: 'fixed', top: 40});

                    // Check to see if the view has scroll back up
                    // above the message AND that the message is
                    // currently fixed.
                } else if ((viewTop + 40 <= originalMessageTop) && message.css('position') == 'fixed') {
                    // Toggle the message classes.
                    message.css({position: 'absolute', top: originalMessageTop});
                }
            });

            $('body').overlay('hide');

            socket.removeListener('getEpg', getEpg);
        };

        socket.on('getEpg', getEpg);

        socket.emit('getEpg', {
            site: 1,
            channelid: channelId
        });
    }

    function getTimer () {
        removeContext($('#body'));

        $(document).attr('title', 'VDRManager // <%= __("Timer") %>');

        var getTimers = function (timer) {
            $('#TimerTemplate').tmpl().appendTo('#body');
            $('#TimerEntryTemplate').tmpl({timer: timer.timers}).appendTo('#timerlist > tbody');

            console.log(timer);

            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    var getTimersNext = function (timer) {
                        if (timer.timers.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }

                        $('#TimerEntryTemplate').tmpl({timer: timer.timers}).appendTo('#timerlist > table > tbody');

                        $('body').overlay('hide');

                        socket.removeListener('getTimers', getTimersNext);
                    };

                    socket.on('getTimers', getTimersNext);

                    socket.emit('getTimers', {
                        site: p
                    });
                }
            });

            $('body').overlay('hide');

            socket.removeListener('getTimers', getTimers);
        };

        socket.on('getTimers', getTimers);

        socket.emit('getTimers', {site: 1});
    }

    function createTimer (filename, channelid, start, stop) {
        var date = new Date(start * 1000);

        var startTime = ((date.getHours() < 10) ? '0' : '') + date.getHours() + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();
        var startDate = date.getFullYear() + '-' + (((date.getMonth() + 1 < 10) ? '0' : '') + (date.getMonth() + 1)) + '-' + ((date.getDate() < 10) ? 0 : '') + date.getDate();

        date = new Date(stop * 1000);

        var endTime = ((date.getHours() < 10) ? '0' : '') + date.getHours() + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();

        var createCb = function () {
            socket.removeListener('timerCreated', createCb);

            var dialog = $('<div></div>').dialog({
                title: "<%= __('Timer created') %>",
                body: '<p>test</p>',
                close: true,
                buttons: [{
                    text: 'Ok',
                    action: 'close'
                }]
            });

            dialog.dialog('show');
        };

        socket.on('timerCreated', createCb);

        socket.emit('createTimer', {
            flags: 1,
            file: filename,
            start: startTime,
            stop: endTime,
            day: startDate,
            channel: channelid,
            weekdays: '-------'
        });
    }

    function editTimer () {

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

        $('#RecordingsTemplate').tmpl().appendTo('#body');

        $('body').overlay('hide');
    }

    function showDetails (channelid, eventid) {
        socket.emit('getDetails', {
            channelid: channelid,
            eventid: eventid
        });

        var cb = function (data) {
            data = data.events[0];
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

            console.log(data);

            var dialog = $('<div></div>').dialog({
                title: data.title,
                subtitle: data.short_text,
                components: components,
                body: '<p>' + data.description + '</p>',
                close: true,
                buttons: [{
                    text: 'Ok',
                    action: 'close'
                }, {
                    text: 'Record',
                    action: function () {
                        createTimer(data.title + ((data.short_text != "") ? ' - ' + data.short_text : ''), channelid, data.start_time, data.start_time + data.duration);
                    },
                    layout: 'danger'
                }],
                onClose: function () {

                }
            });

            dialog.dialog('show');

            socket.removeListener('getDetails', cb);
        };

        socket.on('getDetails', cb);
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

        $('body').overlay('hide');
    }

    function removeContext( item ) {
        item.unbind();
        $(window).unbind('scroll resize');
        $(document).unbind('scroll resize');

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