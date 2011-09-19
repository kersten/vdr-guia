if (vdr.plugins.mqtt === true) {
    mqttClient = new mqtt.MQTTClient(1883, config.vdr.host, 'vdrmanager'),
    
    mqttClient.addListener('sessionOpened', function () {
        console.log('Connected to mosquitto daemon on vdr.');
        console.log('Subscribe to all events.');
        mqttClient.subscribe('application/vdr/status/ChannelSwitch');
    });
    
    mqttClient.addListener('mqttData', function (topic, message) {
        //if (message)
        console.log("\n\n\n\n\n\n");
        console.log(topic.toString());
        console.log("\n\n\n\n\n\n");
    });
}