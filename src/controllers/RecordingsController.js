io.sockets.on('connection', function (socket) {
    function parseDir (dirArray, records) {
        if (dirArray.length == 0) {
            return;
        }
        
        var dirName = dirArray[0];

        if (records[dirName] === undefined) {
            records[dirName] = {
                events: [],
                type: 'folder'
            }
        }
        
        if (dirArray.length == 1) {
            return records[dirName].events
        } else {
            dirArray.shift();
            return parseDir(dirArray, records[dirName].events);
        }
    }
    
    socket.on('RecordingCollection:read', function (data, callback) {
        rest.get(vdr.restful + '/recordings.json').on('success',  function (recordings) {
            var records = [];
            
            recordings.recordings.forEach(function (data) {
                if (data.name.match(/~/)) {
                    var dirArray = data.name.split('~');
                    dirArray.pop();
                    
                    var obj = parseDir(dirArray, {});
                    
                    obj.push(data);
                    records.push(obj);
                } else {
                    records.push(data);
                }
            });
            
            callback(records);
        }).on('error', function (e) {
            console.log(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20);
        });
    });
});