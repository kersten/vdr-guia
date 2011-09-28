var highlights = {
    genretips: {},
    categorytips: {},
    tipofday: {}
};

rest.get(restfulUrl + '/channels.json?start=0&limit=20').on('success', function(data) {
    return;
    for (var i in data.channels) {
        rest.get(restfulUrl + '/events/' + data.channels[i].channel_id + '.json?timespan=0&start=0').on('success',  function (epg) {
            for (var i in epg.events) {
                var genreTip = /\[Genretipp\s(.*?)\]/i.exec(epg.events[i].description);

                if (genreTip != null) {
                    var start = new Date(epg.events[i].start_time * 1000);
                    epg.events[i].day =  start.getYear() + '-' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1) + '-' + ((start.getDate() < 10) ? '0' : '') + start.getDate();

                    if (typeof(highlights.genretips[epg.events[i].day]) == 'undefined') {
                        highlights.genretips[epg.events[i].day] = new Array();
                    }

                    highlights.genretips[epg.events[i].day].push(epg.events[i]);

                    continue;
                }

                var categoryTip = /\[Spartentipp\s(.*?)\]/i.exec(epg.events[i].description);

                if (categoryTip != null) {
                    var start = new Date(epg.events[i].start_time * 1000);
                    epg.events[i].day =  start.getYear() + '-' + (((start.getMonth() + 1)  < 10) ? '0' : '') + (start.getMonth() + 1) + '-' + ((start.getDate() < 10) ? '0' : '') + start.getDate();

                    if (typeof(highlights.categorytips[epg.events[i].day]) == 'undefined') {
                        highlights.categorytips[epg.events[i].day] = new Array();
                    }

                    highlights.categorytips[epg.events[i].day].push(epg.events[i]);

                    continue;
                }
            }
            
            for (var i in highlights) {
                console.log(highlights[i]);
            } 
        }).on('error', function () {
            //syslog.log(syslog.LOG_ERR, 'Error getting epg for channel ' + chan);
        });
    }
}).on('error', function (err) {
    syslog.log(syslog.LOG_ERR, 'Error getting channels');
});;