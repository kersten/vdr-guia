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

        $(document).attr('title', 'GUIA // <%= __("Highlights") %>');

        $('#HighlightsTemplate').tmpl().appendTo('#body');

        $('body').overlay('hide');
    }

    function getTimeline () {
        removeContext($('#body'));

        $('body').overlay('hide');
    }

    function getTvguide () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("TV Guide") %>');

        $('#TvguideTemplate').tmpl().appendTo('#body');

        $('body').overlay('hide');
    }

    function getProgram () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("Program") %>');

        $.vdrmanager.channel.list(function (channels) {
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
        });
    }

    function getEpg (channelId) {
        removeContext($('#epglist'));
        
        $('#epglist').empty();
        $('#EpgTableTemplate').tmpl().appendTo('#epglist');
        
        // Clean evantually binded old events
        $('div#epglist > table > tbody > tr > td:nth-child(4)').die('click');
        $('div#epglist > table > tbody > tr > td:nth-child(1)').die('click');

        // Bind ne events
        $('div#epglist > table > tbody > tr > td:nth-child(1)').live('click', function () {
            var element = this;

            if ($(this).attr('has_timer') == "true") {
                $.vdrmanager.timer.remove(socket, {
                    timerId: $(this).attr('timer_id'),
                    success: function () {
                        var message = $('<div></div>').dialog({
                            title: "<%- __('Timer deleted!') %>",
                            body: "<%- __('This timer has been successfully deleted.') %>",
                            close: true,
                            buttons: [{
                                text: 'Ok',
                                action: 'close'
                            }]
                        });

                        message.dialog('show');

                        $(element).children('.btn_timer').attr('src', '/img/devine/black/16x16/Circle.png');
                        $(element).attr('has_timer', false);
                    }
                });

                return;
            }

            $.vdrmanager.timer.create(socket, {
                flags: 1,
                file: $(this).attr('title') + (($(this).attr('short_text') != "") ? ' - ' + $(this).attr('short_text') : ''),
                start: $(this).attr('start_time'),
                stop: parseFloat($(this).attr('start_time')) + parseFloat($(this).attr('duration')),
                channel: channelId,
                weekdays: '-------',
                success: function (data) {
                    var message = $('<div></div>').dialog({
                        title: "<%- __('Timer created!') %>",
                        close: true,
                        body: "<%- __('Your timer was successfully created. This show will now be recorded.') %>",
                        buttons: [{
                            text: 'OK',
                            action: 'close'
                        }]
                    });

                    message.dialog('show');

                    $(element).children('.btn_timer').attr('src', '/img/devine/black/16x16/Circle-2.png');
                    $(element).attr('has_timer', true);
                    $(element).attr('timer_id', data.id);
                }
            });
        });

        $('div#epglist > table > tbody > tr > td:nth-child(4)').live('click', function () {
            showDetails(channelId, $(this).attr('eventid'));
        });
        
        $.vdrmanager.epg.list(channelId, 1, function (epg) {
            $('#EpgEntryTemplate').tmpl({epg: epg.channelEpg}).appendTo('#epglist > table > tbody');
            
            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');
                    
                    $.vdrmanager.epg.list(channelId, p, function (epg) {
                        if (epg.channelEpg.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }

                        $('#EpgEntryTemplate').tmpl({epg: epg.channelEpg}).appendTo('#epglist > table > tbody');

                        $('body').overlay('hide');
                    });
                }
            });
            
            enableScrollbar();
            
            $('body').overlay('hide');
        });
        
        var channelList = $('#channellist');

        var view = $(window);

        view.bind("scroll resize", function () {
            var viewTop = view.scrollTop();

            if ((viewTop + 40 > channelList.data('top')) && channelList.css('position') != 'fixed') {
                // Toggle the message classes.
                channelList.css({
                    position: 'fixed',
                    top: 40,
                    left: channelList.offset().left - 20,
                    height: $(window).height()
                });

                // Check to see if the view has scroll back up
                // above the message AND that the message is
                // currently fixed.
            } else if ((viewTop + 40 <= channelList.data('top')) && channelList.css('position') == 'fixed') {
                // Toggle the message classes.
                channelList.css({
                    position: '',
                    top: channelList.data('top'),
                    height: channelList.data('height')
                });
            }
        });
    }

    function getTimer () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("Timer") %>');
        
        // Clean evantually binded old events
        $('#timerlist > tbody > tr > td:nth-child(1)').die('click');
        $('#timerlist > tbody > tr > td:nth-child(5)').die('click');

        // Bind ne events
        $('#timerlist > tbody > tr > td:nth-child(1)').live('click', function () {
            var element = this;
            
            $.vdrmanager.timer.remove(socket, {
                timerId: $(this).attr('timerid'),
                success: function () {
                    var message = $('<div></div>').dialog({
                        title: "<%- __('Timer deleted!') %>",
                        body: "<%- __('This timer has been successfully deleted.') %>",
                        close: true,
                        buttons: [{
                            text: 'Ok',
                            action: 'close'
                        }]
                    });

                    message.dialog('show');

                    if (typeof(removeEl) != 'undefined' && removeEl === true) {
                        $(element).parent().fadeOut(function () {
                            $(element).parent().remove();
                        });
                    }

                    $(element).children('.btn_timer').attr('src', '/img/devine/black/16x16/Circle.png');
                    $(element).attr('has_timer', false);
                }
            });
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
            
            enableScrollbar();

            $('body').overlay('hide');

            socket.removeListener('getTimers', getTimers);
        };

        socket.on('getTimers', getTimers);

        socket.emit('getTimers', {site: 1});
    }

    function getSearch () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("Search") %>');

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
            if ($(this).attr('has_timer') == "true") {
                showDetails($(this).attr('channelid'), $(this).attr('eventid'), $(this).attr('timer_id'));
                return;
            }
            
            showDetails($(this).attr('channelid'), $(this).attr('eventid'));
        });

        // Unbind click
        $('#submitSearch').unbind('click');

        $('#submitSearch').click(function () {
            $('body').overlay('show');
            $('#searchresultlist').empty();

            var searchCb = function (data) {
                if (data.events.length == 0) {
                    $('#SearchResultEmptyTemplate').tmpl().appendTo('#searchresultlist');
                } else {
                    $('#SearchTableTemplate').tmpl().appendTo('#searchresultlist');

                    $('#SearchEntryTemplate').tmpl(data).appendTo('#searchresultlist > table > tbody');
                }
                
                enableScrollbar();
                
                $('body').overlay('hide');

                socket.removeListener('searchResult', searchCb);
            };

            socket.on('searchResult', searchCb);
            
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

        $(document).attr('title', 'GUIA // <%= __("Searchtimer") %>');
        
        $('#SearchtimerTemplate').tmpl().appendTo('#body');
        
        $('#createSearchTimer').live('click', function () {
            var message = $('<div></div>').dialog({
                title: "<%- __('Create a new searchtimer') %>",
                body: "<%- __('Are you sure that you want to delete this recording? This action cannot be undone!') %>",
                close: true,
                buttons: [{
                    text: 'Create',
                    action: 'close'
                }]
            });

            message.dialog('show');
        });
        
        $.vdrmanager.search.timer(1, function (searchtimers) {
            $('#SearchtimerEntryTemplate').tmpl({
                searchtimers: searchtimers
            }).appendTo('table#searchtimerlist > tbody');

            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    $.vdrmanager.search.timer(p, function (data) {
                        if (data.length == 0) {
                            $(document).unbind('scroll resize');
                            $('body').overlay('hide');
                            return;
                        }
                        
                        $('#SearchtimerEntryTemplate').tmpl({
                            searchtimers: data
                        }).appendTo('table#searchtimerlist > tbody');
                        
                        /*$('table#recordingslist > tbody > tr > td:nth-child(1) > input').each(function () {
                            if (!$(this).is(':checked')) {
                                $(this).attr('checked', $('#recordingsDeleteAll').is(':checked'));
                            } 
                        });*/

                        $('body').overlay('hide');
                    });
                }
            });
            
            var header = $('#deleteSelectedSearchtimer').parent().data({
                height: $('#deleteSelectedSearchtimer').parent().height(),
                width: $('#deleteSelectedSearchtimer').parent().width(),
                top: $('#deleteSelectedSearchtimer').parent().offset().top
            });
            var view = $(window);

            view.bind("scroll resize", function () {
                var viewTop = view.scrollTop();

                if ((viewTop + 40 > header.data('top')) && header.css('position') != 'fixed') {
                    console.log(header);
                    // Toggle the message classes.
                    header.css({
                        position: 'fixed',
                        top: 20,
                        left: header.offset().left,
                        height: header.data('height'),
                        width: header.data('width')
                    });

                    // Check to see if the view has scroll back up
                    // above the message AND that the message is
                    // currently fixed.
                } else if ((viewTop + 40 <= header.data('top')) && header.css('position') == 'fixed') {
                    // Toggle the message classes.
                    header.css({
                        position: '',
                        top: header.data('top'),
                        height: header.data('height'),
                        width: header.data('width')
                    });
                }
            });

            $('body').overlay('hide');

            enableScrollbar();
        });

        $('body').overlay('hide');
    }

    function getRecordings () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("Recordings") %>');
        
        // Clean evantually binded old events
        $('table#recordingslist > tbody > tr > td:nth-child(2)').die('click');
        $('table#recordingslist > tbody > tr > td:nth-child(6)').die('click');
        $('#recordingsDeleteAll').die('change');

        // Bind new events
        $('#recordingsDeleteAll').live('change', function () {
            $('table#recordingslist > tbody > tr > td:nth-child(1) > input').attr('checked', $('#recordingsDeleteAll').is(':checked'));
            $('table#recordingslist > tbody > tr > td:nth-child(1) > input').trigger('change');
        });
        
        $('table#recordingslist > tbody > tr > td:nth-child(1) > input').live('change', function () {
            if ($('table#recordingslist > tbody > tr > td:nth-child(1) > input').is(':checked')) {
                $('#deleteSelectedRecordings').removeClass('disabled');
            } else {
                $('#deleteSelectedRecordings').addClass('disabled');
            }
        });

        $('table#recordingslist > tbody > tr > td:nth-child(2)').live('click', function () {
            var element = $(this);

            var message = $('<div></div>').dialog({
                title: "<%- __('Delete this recording?') %>",
                body: "<%- __('Are you sure that you want to delete this recording? This action cannot be undone!') %>",
                close: true,
                buttons: [{
                    text: 'Yes, I know what I do',
                    type: 'error',
                    action: function () {
                        $(this).parent().parent().parent().dialog('hide');

                        $.vdrmanager.recording.remove($(element).attr('number'), function () {
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

                            $(element).parent().fadeOut(function () {
                                $(element).parent().remove();
                            });
                            
                            $('table#recordingslist > tbody > tr > td:nth-child(2)').each(function () {
                                if (parseInt($(this).attr('number')) > $(element).attr('number')) {
                                    $(this).attr('number', parseInt($(this).attr('number')) - 1);
                                }
                            });
                        });
                    },
                    layout: 'danger'
                }, {
                    text: 'No',
                    action: 'close'
                }]
            });

            message.dialog('show');
        });
        
        $('#deleteSelectedRecordings').live('click', function () {
            if ($(this).is('.disabled')) {
                return;
            }
            
            var toDelete = 0;
            var toDeleteEl = new Array();
            
            function deleteRecords () {
                $.vdrmanager.recording.remove($(toDeleteEl[0]).attr('number'), function () {
                    var element = toDeleteEl.shift();
                    
                    $(element).parent().parent().fadeOut(function () {
                        $(element).parent().parent().remove();
                    });
                    
                    toDelete++;
                    
                    if ($('table#recordingslist > tbody > tr > td:nth-child(1) > input:checked').length != toDelete) {
                        deleteRecords();
                    }
                });
            }
            
            var checkDelete = setInterval(function () {
                if ($('table#recordingslist > tbody > tr > td:nth-child(1) > input:checked').length == toDelete) {
                    clearInterval(checkDelete);
                    
                    var dialogOk = $('<div></div>').dialog({
                        title: "<%= __('Seletced recordings deleted') %>",
                        body: '<p>test</p>',
                        close: true,
                        buttons: [{
                            text: 'OK',
                            action: 'close'
                        }]
                    });

                    $('body').overlay('hide');
                    dialogOk.dialog('show');
                }
            }, 100);
            
            var message = $('<div></div>').dialog({
                title: "<%- __('Delete selected recordings?') %>",
                body: "<%- __('Are you sure that you want to delete this recording? This action cannot be undone!') %>",
                close: true,
                buttons: [{
                    text: 'Yes, I know what I do',
                    type: 'error',
                    action: function () {
                        $('body').overlay('show');
                        $(this).parent().parent().parent().dialog('hide');

                        $('table#recordingslist > tbody > tr > td:nth-child(1) > input:checked').each(function () {
                            var self = this;
                            $('table#recordingslist > tbody > tr > td:nth-child(1) > input').each(function () {
                                if (parseInt($(this).attr('number')) > parseInt($(self).attr('number'))) {
                                    $(this).attr('number', parseInt($(this).attr('number')) - 1);
                                }
                            });

                            toDeleteEl.push(this);
                        });

                        deleteRecords();
                    },
                    layout: 'danger'
                }, {
                    text: 'No',
                    action: 'close'
                }]
            });

            message.dialog('show');
        });

        $('table#recordingslist > tbody > tr > td:nth-child(6)').live('click', function () {
            console.log($(this).attr('number'));
        });

        $.vdrmanager.recording.list(1, function (data) {
            $('#RecordingsTemplate').tmpl().appendTo('#body');
            $('#RecordingEntryTemplate').tmpl({recordings: data.recordings}).appendTo('#recordingslist > tbody');
            
            $(document).endlessScroll({
                callback: function (p) {
                    $('body').overlay('show');

                    $.vdrmanager.recording.list(p, function (data) {
                        $('#RecordingEntryTemplate').tmpl({recordings: data.recordings}).appendTo('#recordingslist > tbody');
                        $('table#recordingslist > tbody > tr > td:nth-child(1) > input').each(function () {
                            if (!$(this).is(':checked')) {
                                $(this).attr('checked', $('#recordingsDeleteAll').is(':checked'));
                            } 
                        });

                        $('body').overlay('hide');
                    });
                }
            });
            
            var header = $('#deleteSelectedRecordings').parent().data({
                height: $('#deleteSelectedRecordings').parent().height(),
                width: $('#deleteSelectedRecordings').parent().width(),
                top: $('#deleteSelectedRecordings').parent().offset().top
            });
            var view = $(window);

            view.bind("scroll resize", function () {
                var viewTop = view.scrollTop();

                if ((viewTop + 40 > header.data('top')) && header.css('position') != 'fixed') {
                    console.log(header);
                    // Toggle the message classes.
                    header.css({
                        position: 'fixed',
                        top: 20,
                        left: header.offset().left,
                        height: header.data('height'),
                        width: header.data('width')
                    });

                    // Check to see if the view has scroll back up
                    // above the message AND that the message is
                    // currently fixed.
                } else if ((viewTop + 40 <= header.data('top')) && header.css('position') == 'fixed') {
                    // Toggle the message classes.
                    header.css({
                        position: '',
                        top: header.data('top'),
                        height: header.data('height'),
                        width: header.data('width')
                    });
                }
            });

            $('body').overlay('hide');

            enableScrollbar();
        });

        $('body').overlay('hide');
    }

    function showDetails (channelid, eventid, timerId) {
        $.vdrmanager.epg.details(eventid, channelid, function (data, components) {
            if (!data.timer_exists) {
                var recordButton = {
                    text: "<%= __('Record') %>",
                    action: function () {
                        createTimer(data.title + ((data.short_text != "") ? ' - ' + data.short_text : ''), channelid, data.start_time, parseFloat(data.start_time) + parseFloat(data.duration));
                    },
                    layout: 'danger'
                };
            } else {
                var recordButton = {
                    text: "<%= __('Delete timer') %>",
                    action: function () {
                        deleteTimer(dialog, timerId);
                    },
                    layout: 'danger'
                };
            }

            var dialog = $('<div></div>').dialog({
                title: data.title,
                subtitle: data.short_text,
                components: components,
                body: '<p>' + data.description + '</p>',
                close: true,
                buttons: [{
                    text: "<%= __('Ok') %>",
                    action: 'close'
                }, recordButton],
                onClose: function () {

                }
            });

            dialog.dialog('show');
        });
    }

    function getSettings () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("Settings") %>');

        $('body').overlay('hide');
    }

    function getAbout () {
        removeContext($('#body'));

        $(document).attr('title', 'GUIA // <%= __("About") %>');

        $('#AboutTemplate').tmpl().appendTo('#body');

        $('body').overlay('hide');
    }

    function getLogout () {
        removeContext($('#body'));

        $('body').overlay('hide');
    }
    
    var checkScrollbar = null;

    function removeContext( item ) {
        item.unbind();
        $(window).unbind('scroll resize');
        $(document).unbind('scroll resize endless.scroll');
        
        clearTimeout(checkScrollbar);

        item.children().remove();
    }
    
    function enableScrollbar () {
        if ($("body").height() < $(window).height()) {
            $(document).trigger('scroll');
            
            checkScrollbar = setTimeout(enableScrollbar, 1000);
        }
    }
    
    socket.on('mosquittoChannelSwitch', function (message) {
        console.log('Switched to channel ' + message.channelName);
    });

    var disconnected = false;

    socket.on('disconnect', function() {
        if (!disconnected) {
            var dialog = $('<div></div>').dialog({
                title: "<%= __('GUIA Server has disconnected') %>",
                body: '<p><%= __("The App lost the connection to the server, please try to reconnect or leave this site!") %></p>',
                close: true,
                buttons: [{
                    text: '<%= __("Reconnect") %>',
                    action: 'close'
                }]
            });

            dialog.dialog('show');
        }
        
        disconnected = true;
    });
});