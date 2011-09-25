if (vdr.plugins.mqtt === true) {
    var mqtt = require('MQTTClient');
    
    console.log('Connecting to mqtt mosquitto server');
    
    mqttClient = new mqtt.MQTTClient(1883, config.vdr.host, 'vdrmanager'),

    mqttClient.addListener('sessionOpened', function () {
        console.log('Connected to mosquitto daemon on vdr.');
        console.log('Subscribe to all events.');
        mqttClient.subscribe('application/vdr/status/+');
    });
    
    io.sockets.on('connection', function (socket) {
        mqttClient.addListener('mqttData', function (topic, message) {
            try {
                message = JSON.parse(message.toString());
            } catch (e) {
                return;
            }
            
            var data = message.data;
            
            switch (message.method) {
            case 'TimerChange':
                break;
            
            case 'ChannelSwitch':
                if (data.channelNumber != 0 && data.device.isPrimaryDevice) {
                    console.log(vdr.channelList[data.channelNumber]);
                
                    data['channelName'] = vdr.channelList[data.channelNumber - 1].name;
                } else {
                    return;
                }
                
                break;
            
            case 'Recording':
                break;
            
            case 'Replaying':
                break;
            
            case 'SetVolume':
                break;
            
            case 'SetAudioTrack':
                break;
            
            case 'SetAudioChannel':
                break;
            
            case 'SetSubtitleTrack':
                break;
            
            case 'OsdClear':
                break;
            
            case 'OsdTitle':
                break;
            
            case 'OsdStatusMessage':
                break;
            
            case 'OsdHelpKeys':
                break;
            
            case 'OsdItem':
                break;
            
            case 'OsdCurrentItem':
                break;
            
            case 'OsdTextItem':
                break;
            
            case 'OsdChannel':
                break;
            
            case 'OsdProgramme':
                break;
            
            case 'ChannelProtected':
                break;
            
            case 'ReplayProtected':
                break;
            
            case 'RecordingFile':
                break;
            
            case 'TimerCreation':
                break;
            
            case 'PluginProtected':
                break;
            
            case 'UserAction':
                break;
            
            case 'MenuItemProtected':
                break;
            
            case 'OsdSetRecording':
                break;
            
            case 'OsdSetEvent':
                break;
            
            case 'OsdMenuDisplay':
                break;
            
            case 'OsdMenuDestroy':
                break;
            
            case 'OsdEventItem':
                break;
            }
            
            socket.emit('mosquitto' + message.method, data);
        });
    });
}