jQuery.extend({
    vdrmanager: {
        timer: {
            create: function (socket, options) {
                if (typeof(options.flags) == 'undefined') {
                    throw "<%- __('The timer flags are not defined!') %>"
                }
                
                if (typeof(options.channel) == 'undefined') {
                    throw "<%- __('The timer channel is not defined!') %>"
                }
                
                if (typeof(options.start) == 'undefined') {
                    throw "<%- __('The timer start is not defined!') %>"
                }
                
                if (typeof(options.stop) == 'undefined') {
                    throw "<%- __('The timer stop is not defined!') %>"
                }
                
                if (typeof(options.file) == 'undefined') {
                    throw "<%- __('The timer filename is not defined!') %>"
                }
                
                if (typeof(options.weekdays) == 'undefined') {
                    throw "<%- __('The timer weekdays are not defined!') %>"
                }
                
                var date = new Date(options.start * 1000);

                var startTime = date.getHours() + '' + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();
                var startDate = date.getFullYear() + '-' + (((date.getMonth() + 1 < 10) ? '0' : '') + (date.getMonth() + 1)) + '-' + ((date.getDate() < 10) ? 0 : '') + date.getDate();

                date = new Date(options.stop * 1000);

                var endTime = date.getHours() + '' + ((date.getMinutes() < 10) ? '0' : '') + date.getMinutes();
                
                var createCb = function () {
                    socket.removeListener('timerCreated', createCb);
                    
                    if (typeof(options.success) != 'undefined') {
                        options.success();
                    }
                };
                
                socket.on('timerCreated', createCb);

                socket.emit('createTimer', {
                    flags: options.flags,
                    file: options.file,
                    start: parseInt(startTime),
                    stop: parseInt(endTime),
                    day: startDate,
                    channel: options.channel,
                    weekdays: options.weekdays
                });
            },
            remove: function (socket, options) {
                if (typeof(options.timerId) == 'undefined') {
                    throw "<%- __('The timer id is not defined!') %>"
                }
                
                var deleteCb = function () {
                    socket.removeListener('timerDeleted', deleteCb);

                    if (typeof(options.success) != 'undefined') {
                        options.success();
                    }
                };

                socket.on('timerDeleted', deleteCb);

                socket.emit('deleteTimer', {
                    timerId: options.timerId
                });
            },
            update: function () {
                
            } 
        }
    }
});