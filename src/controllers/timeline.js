module.exports = {
    index: function (req, res) {
        var channels = new Object();

        rest.get(restfulUrl + '/channels/.json?&start=0&limit=10').on('complete', function(data) {
            var render = function () {
                if (data.channels.length != waitForFinish) return;

                channels = ksort(channels);

                res.render((isMobileDevice) ? 'mob/timeline': 'timeline', {
                    layout: false,
                    global: {
                        title: 'Timeline',
                        loggedIn: req.session.loggedIn,
                        page: 'timeline'
                    },
                    channels: channels,
                    switchUrl: restfulUrl + '/remote/switch',
                    ts: Math.round((new Date()).getTime() / 1000)
                });
            };

            var waitForFinish = 0;

            data.channels.forEach(function (channel) {
                rest.get(restfulUrl + '/events/' + channel.channel_id + '.json?start=0', {channel: channel}).on('complete',  function (epg) {
                    for (var i in epg.events) {
                        //var regEx = /Kategorie: (.*?)$/im; // tvm2vdr
                        /*var regEx = /^(.*?)\ .*$/i;
                        regEx.exec(epg.events[i].short_text);

                        if (RegExp.$1 == "") {
                            regEx.exec(epg.events[i].description);
                        }

                        var cat = RegExp.$1;

                        console.log(cat);
                        for (var x in categories) {
                            for(var y = 0; y < categories[x].equals.length; y++) {
                                if(categories[x].equals[y] == cat) {
                                    epg.events[i].category = x;
                                    epg.events[i].color = categories[x].color;
                                    break;
                                }
                            }

                            if (typeof(epg.events[i].category) == 'undefined') {
                                for(var y = 0; y < categories[x].regex.length; y++) {
                                    if(cat.match(categories[x].regex[y])) {
                                        epg.events[i].category = x;
                                        epg.events[i].color = categories[x].color;
                                        break;
                                    }
                                }
                            }

                            if (typeof(epg.events[i].category) != 'undefined') {
                                break;
                            }
                        }*/

                        if (epg.events[i].components.length != 0) {
                            console.log(epg.events[i].components);
                        }

                        if (typeof(epg.events[i].category) == 'undefined') {
                            epg.events[i].category = 'Sonstiges';
                            epg.events[i].color = {
                                'background-color': '#CCCCCC',
                                'background-image': '-moz-linear-gradient(center top , #666666, #CCCCCC)',
                                'font-color': '#000000'
                            };
                        }
                    }

                    channels[this.options.channel.number] = {
                        channel: this.options.channel,
                        epg: epg
                    };

                    waitForFinish++;
                    render();
                }).on('error', function (err) {
                    waitForFinish++;
                    render();
                }).on('404', function () {
                    waitForFinish++;
                    render();
                });
            });
        }).on('error', function () {
            console.log('No Host');
        });
    }
};