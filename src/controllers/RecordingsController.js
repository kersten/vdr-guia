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
            recordings = recordings.recordings;
            var records = new Array();
            var directories = new Array();
            
            recordings.forEach(function (data) {
                if (data.name.match(/~/)) {
                    var directory = data.name.split('~');
                    
                    if (directories.indexOf(directory[0]) != -1) {
                        return;
                    }
                    
                    directories.push(directory[0])
                    data.name = directory[0];
                    data.directory = true;
                }
                
                records.push(data);
            });
            
            callback(records);
        }).on('error', function (e) {
            console.log(vdr.restful + '/recordings.json?start=' + start + '&limit=' + 20);
        });
    });
    
    socket.on('Recording:readOne', function (data, callback) {
        rest.get(vdr.restful + '/recordings/' + data.number + '.json').on('success', function (data) {
            callback(data.recordings[0]);
        }).on('error', function () {
        }).on('403', function () {
        });
    });
});