var TimerView = Backbone.View.extend({
    url: "timer",
    
    addTimer: function (timer) {
        var tr = $('<tr></tr>').css('cursor', 'pointer').click(function () {
            socket.emit('Event:readOne', {
                channel_id: timer.get('channel'),
                event_id: timer.get('event_id')
            }, function (data) {
                if (typeof(data.error) != 'undefined') {
                    
                } else {
                    console.log(data)
                    $('#timer_details > .modal-header > h3').text(data.title);
                    $('#timer_details > .modal-body > p').text(data.description);
                    $('#timer_details').modal({backdrop: true, keyboard: true, show: true});
                }
            });
        });
        
        console.log(timer);
        
        var timerName = $('<td></td>').text(timer.get('channel_name'));
        var timerDay = $('<td></td>').text(timer.get('day'));
        var timerStart = $('<td></td>').text(timer.get('start'));
        var timerEnd = $('<td></td>').text(timer.get('stop'));
        var timerFile = $('<td></td>').text(timer.get('filename'));

        tr.append(timerName);
        tr.append(timerDay);
        tr.append(timerStart);
        tr.append(timerEnd);
        tr.append(timerFile);
        
        $('#timertable > tbody').append(tr);
    },
    
    generateHTML: function (callback) {
        var self = this;
        
        callback.apply(this, [_.template(self.template)]);
        
        var maxHeight = $(window).height() - $('#content').outerHeight() - $('.topbar').outerHeight();
        
        $('#timerlist').parent().css({maxHeight: maxHeight, height: maxHeight});
        $('#timerlist').css({
            height: maxHeight,
            maxHeight: maxHeight,
            position: 'absolute',
            overflow: 'auto',
            top:0,
            right: 0
        });
        
        this.timerlist = new TimerCollection();
        
        this.items = Math.ceil(maxHeight / 36) * 2;

        this.page = 1;

        this.timerlist.fetch({
            data: {
                page: this.page,
                limit: this.items
            }, success: function (collection) {
                collection.forEach(function (timer) {
                    self.addTimer(timer);
                });
                
                Application.loadingOverlay('hide');
                
                $('#timerlist').endlessScroll({
                    callback: function (p) {
                        Application.loadingOverlay('show');
                        self.page = p + 1;
                        self.timerlist.fetch({data: {page: self.page, limit: self.items}, success: function (collection) {
                            if (collection.length == 0) {
                                $('#timerlist').unbind('scroll');
                            }
                            
                            collection.forEach(function (timer) {
                                self.addTimer(timer);
                            });
                            
                            Application.loadingOverlay('hide');
                        }});
                    }
                });
            }
        });
    },
    
    render: function () {
        var self = this;

        if (this.template == null) {
            return this;
        }

        this.generateHTML(function (res) {
            self.el.html(res);
            $(document).attr('title', $('#header_div').attr('title'));

            if (typeof(self.postRender) == 'function') {
                self.postRender();
            }
        });

        return this;
    }
});