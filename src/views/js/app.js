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
                loadHash();
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

            $('#channellist').css('height', $(window).height() - $('#channellist').offset().top).data({
                height: $(window).height() - $('#channellist').offset().top,
                top: $('#channellist').offset().top
            });

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
                if ($(this).attr('has_timer') == "true") {
                    deleteTimer(this, $(this).attr('timer_id'));
                    return;
                }

                createTimer(this,
                    $(this).attr('title') +
                    (($(this).attr('short_text') != "") ? ' - ' + $(this).attr('short_text') : ''),
                    channelId,
                    $(this).attr('start_time'),
                    parseFloat($(this).attr('start_time')) + parseFloat($(this).attr('duration'))
                );
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

            var channelList = $( "#channellist" );

            var view = $( window );

            view.bind("scroll resize", function () {
                var viewTop = view.scrollTop();

                if ((viewTop + 40 > channelList.data('top')) && channelList.css('position') != 'fixed') {
                    // Toggle the message classes.
                    channelList.css({
                        position: 'fixed',
                        top: 40,
                        height: $(window).height()
                    });

                    // Check to see if the view has scroll back up
                    // above the message AND that the message is
                    // currently fixed.
                } else if ((viewTop + 40 <= channelList.data('top')) && channelList.css('position') == 'fixed') {
                    // Toggle the message classes.
                    channelList.css({
                        position: 'absolute',
                        top: channelList.data('top'),
                        height: channelList.data('height')
                    });
                }
            });

            $(window).trigger('scroll');

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
        
        // Clean evantually binded old events
        $('#timerlist > tbody > tr > td:nth-child(1)').die('click');
        $('#timerlist > tbody > tr > td:nth-child(5)').die('click');

        // Bind ne events
        $('#timerlist > tbody > tr > td:nth-child(1)').live('click', function () {
            deleteTimer(this, $(this).attr('timerid'), true);
            return;
        });

        $('#timerlist > tbody > tr > td:nth-child(5)').live('click', function () {
            showDetails($(this).attr('channelid'), $(this).attr('eventid'));
        });

        var getTimers = function (timer) {
            $('#TimerTemplate').tmpl().appendTo('#body');
            $('#TimerEntryTemplate').tmpl({timer: timer.timers}).appendTo('#timerlist > tbody');

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

    function createTimer (element, filename, channelid, start, stop) {
        var date = new Date(start * 1000);

        var startTime = ((date.getHours() < 10) ? '0' : '') + date.getHours() + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();
        var startDate = date.getFullYear() + '-' + (((date.getMonth() + 1 < 10) ? '0' : '') + (date.getMonth() + 1)) + '-' + ((date.getDate() < 10) ? 0 : '') + date.getDate();

        date = new Date(stop * 1000);

        var endTime = ((date.getHours() < 10) ? '0' : '') + date.getHours() + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();

        var createCb = function () {
            socket.removeListener('timerCreated', createCb);
            
            var message = $('<div></div>').alertmessage({
                close: true,
                text: "<%- __('<strong>Timer created!</strong> Your timer was successfully created. This show will now be recorded.') %>",
                buttons: [{
                    text: 'OK',
                    action: 'close'
                }]
            });

            message.alertmessage('show');

            $(element).children('.btn_timer').attr('src', '/img/devine/black/Circle-2.png');
            $(element).attr('has_timer', true);
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

    function deleteTimer (element, timerId, removeEl) {
        var deleteCb = function () {
            socket.removeListener('timerDeleted', deleteCb);

            var message = $('<div></div>').alertmessage({
                text: "<%- __('<strong>Timer deleted!</strong> This timer has been successfully deleted.') %>",
                close: true,
                buttons: [{
                    text: 'Ok',
                    action: 'close'
                }]
            });

            message.alertmessage('show');
            
            if (typeof(removeEl) != 'undefined' && removeEl === true) {
                $(element).parent().fadeOut(function () {
                    $(element).parent().remove();
                });
            }

            $(element).children('.btn_timer').attr('src', '/img/devine/black/Circle.png');
            $(element).attr('has_timer', false);
        };

        socket.on('timerDeleted', deleteCb);

        socket.emit('deleteTimer', {
            timerId: timerId
        });
    }

    function editTimer () {

    }

    function getSearch () {
        removeContext($('#body'));

        $(document).attr('title', 'VDRManager // <%= __("Search") %>');

        $('#SearchTemplate').tmpl().appendTo('#body');
        
        // Clean evantually binded old events
        $('div#searchresultlist > table > tbody > tr > td:nth-child(4)').die('click');
        $('div#searchresultlist > table > tbody > tr > td:nth-child(1)').die('click');

        // Bind ne events
        $('div#searchresultlist > table > tbody > tr > td:nth-child(1)').live('click', function () {
            if ($(this).attr('has_timer') == "true") {
                deleteTimer(this, $(this).attr('timer_id'));
                return;
            }

            createTimer(this,
                $(this).attr('title') +
                (($(this).attr('short_text') != "") ? ' - ' + $(this).attr('short_text') : ''),
                $(this).attr('channelid'),
                $(this).attr('start_time'),
                parseFloat($(this).attr('start_time')) + parseFloat($(this).attr('duration'))
            );
        });

        $('div#searchresultlist > table > tbody > tr > td:nth-child(4)').live('click', function () {
            showDetails($(this).attr('channelid'), $(this).attr('eventid'));
        });

        // Unbind click
        $('#submitSearch').unbind('click');

        $('#submitSearch').click(function () {
            $('body').overlay('show');
            $('#searchresultlist > table > tbody').empty();

            var searchCb = function (data) {
                if (data.events.length == 0) {
                    $('#SearchResultEmptyTemplate').tmpl().appendTo('#body');
                } else {
                    $('#SearchTableTemplate').tmpl().appendTo('#body');

                    $('#SearchEntryTemplate').tmpl(data).appendTo('#searchresultlist > table > tbody');
                }
                
                $('body').overlay('hide');

                socket.removeListener('searchResult', searchCb);
            };

            socket.on('searchResult', searchCb);
            
            if ($("body").height() > $(window).height()) {
                alert("Vertical Scrollbar! D:");
            }

            
            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    var searchCbNext = function (data) {
                        if (data.events.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }

                        $('#SearchEntryTemplate').tmpl(data).appendTo('#searchresultlist > table > tbody');

                        $('body').overlay('hide');

                        socket.removeListener('searchResult', searchCbNext);
                    };

                    socket.on('searchResult', searchCbNext);

                    socket.emit('search', {
                        site: p,
                        term: $('#searchterm').val(),
                        subtitle: ($('#searchSubtitle').attr('checked') != 'undefined' && $('#searchSubtitle').attr('checked') == 'checked') ? true : false,
                        description: ($('#searchDescription').attr('checked') != 'undefined' && $('#searchDescription').attr('checked') == 'checked') ? true : false
                    });
                }
            });

            socket.emit('search', {
                site: 1,
                term: $('#searchterm').val(),
                subtitle: ($('#searchSubtitle').attr('checked') != 'undefined' && $('#searchSubtitle').attr('checked') == 'checked') ? true : false,
                description: ($('#searchDescription').attr('checked') != 'undefined' && $('#searchDescription').attr('checked') == 'checked') ? true : false
            });

            return false;
        });

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

        var getRecordings = function (recordings) {
            $('#RecordingsTemplate').tmpl().appendTo('#body');
            $('#RecordingEntryTemplate').tmpl({recordings: recordings.recordings}).appendTo('#recordingslist > tbody');

            // Clean evantually binded old events
            $('table#recordingslist > tbody > tr > td:nth-child(1)').die('click');
            $('table#recordingslist > tbody > tr > td:nth-child(4)').die('click');

            // Bind ne events
            $('table#recordingslist > tbody > tr > td:nth-child(1)').live('click', function () {
                deleteRecording($(this).parent(), $(this).attr('number'));
            });

            $('table#recordingslist > tbody > tr > td:nth-child(4)').live('click', function () {
                console.log($(this).attr('number'));
            });

            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    var getRecordingsNext = function (recordings) {
                        if (recordings.recordings.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }

                        $('#RecordingEntryTemplate').tmpl({recordings: recordings.recordings}).appendTo('#recordingslist > tbody');

                        $('body').overlay('hide');

                        socket.removeListener('getRecordings', getRecordingsNext);
                    };

                    socket.on('getRecordings', getRecordingsNext);

                    socket.emit('getRecordings', {
                        site: p
                    });
                }
            });

            $('body').overlay('hide');

            socket.removeListener('getRecordings', getRecordings);
        };

        socket.on('getRecordings', getRecordings);

        socket.emit('getRecordings', {site: 1});

        $('body').overlay('hide');
    }
    
    function deleteRecording (element, recordNumber) {
        var message = $('<div></div>').dialog({
            title: "<%- __('Delete this recording?') %>",
            body: "<%- __('Are you sure that you want to delete this recording? This action cannot be undone!') %>",
            close: true,
            buttons: [{
                text: 'Yes, I know what I do',
                type: 'error',
                action: function () {
                    $(this).parent().parent().parent().dialog('hide');

                    var deleteCb = function () {
                        var dialogOk = $('<div></div>').dialog({
                            title: "<%= __('Recording deleted') %>",
                            body: '<p>test</p>',
                            close: true,
                            buttons: [{
                                text: 'OK',
                                action: 'close'
                            }]
                        });

                        dialogOk.dialog('show');
                        
                        $(element).fadeOut(function () {
                            $(element).remove();
                        });
                        

                        socket.removeListener('recordingDeleted', deleteCb);
                    };

                    socket.on('recordingDeleted', deleteCb);

                    socket.emit('deleteRecording', {number: recordNumber});
                },
                layout: 'danger'
            }, {
                text: 'No',
                action: 'close'
            }]
        });

        message.dialog('show');
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
                subtitles: [],
                rating: null,
                parentalRating: null,
                actors: [],
                directors: [],
                countries: []
            }

            // Extract rating
            var ratingRegExp = /\[(.*)[-\*]{0,5}\]/.exec(data.description);
            if (ratingRegExp != null) {
                components.rating = ratingRegExp[1];
            }

            // Extract age rating
            var parentalRatingRegExp = /\nFSK:\s(.*?)\n/.exec(data.description);
            if (parentalRatingRegExp != null) {
                components.parentalRating = parentalRatingRegExp[1];
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
                    components.subtitles.push(data.components[i].language);
                    break;

                case 'HD-Video':
                    components.video = 'hd';
                    break;

                case '16:9':
                    components.format = '16:9';
                }
            }

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
                        createTimer(data.title + ((data.short_text != "") ? ' - ' + data.short_text : ''), channelid, data.start_time, parseFloat(data.start_time) + parseFloat(data.duration));
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
        $(document).unbind('scroll resize endless.scroll');

        item.children().remove();
    }

    socket.on('disconnect', function() {
        var dialog = $('<div></div>').dialog({
            title: "<%= __('VDRManager Server has disconnected') %>",
            body: '<p><%= __("The App lost the connection to the server, please try to reconnect or leave this site!") %></p>',
            close: true,
            buttons: [{
                text: '<%= __("Reconnect") %>',
                action: 'close'
            }]
        });

        dialog.dialog('show');
    });
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