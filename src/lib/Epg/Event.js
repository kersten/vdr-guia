/*
 {
 "id":51514,
 "title":"Eine Serie",
 "short_text":"Der Episodentitel",
 "description":"Die Beschreibung",
 "start_time":1308845100,
 "duration":3300,
 "images":3,
 "count":1,
 "timer_exists":true,
 "timer_active":true,
 "timer_id":"C-71-71-61920:0:1315173600:2100:2300",
 "components":[
 {"stream":5, "type":11, "language":"deu", "description":"H.264\/AVC high definition Video, 16:9 aspect ratio,"},
 {"stream":2,"type":3,"language":"deu","description":"stereo deutsch"},
 {"stream":2,"type":3,"language":"eng","description":"stereo englisch"},
 {"stream":2,"type":5,"language":"deu","description":"Dolby Digital 2.0"}
*/

function EpgEvent () {
    this.event = {
        id: null,
        title: null,
        short_text: null,
        description: null,
        start_time: null,
        duration: null,
        images: null,
        count: null,
        timer_exists: null,
        timer_id: null,
        components: null
    };
}

EpgEvent.prototype.get = function (_id, callback) {
    events.findOne({_id: _id}, function (err, doc) {
        if (doc) {
            this.event
            callback(doc);
        } else {
            callback(null);
        }
    });
};