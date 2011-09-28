jQuery.extend($.vdrmanager, {
    epg: {
        list: function (channelid, site, cb) {
            var getEpg = function (epg) {
                cb.apply(this, arguments);

                socket.removeListener('getEpg', getEpg);
            };

            socket.on('getEpg', getEpg);

            socket.emit('getEpg', {
                site: site,
                channelid: channelid
            });
        },
        details: function (eventid, channelid, cb) {
            var detailsCb = function (data) {
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
                
                var result = [
                    data,
                    components
                ];
                
                cb.apply(this, result);

                socket.removeListener('getDetails', detailsCb);
            };
            
            socket.on('getDetails', detailsCb);
            
            socket.emit('getDetails', {
                channelid: channelid,
                eventid: eventid
            });
        }
    }
});