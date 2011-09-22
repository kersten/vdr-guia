if (vdr.plugins.mqtt === true) {
    mqttClient = new mqtt.MQTTClient(1883, config.vdr.host, 'vdrmanager'),
    
    mqttClient.addListener('sessionOpened', function () {
        console.log('Connected to mosquitto daemon on vdr.');
        console.log('Subscribe to all events.');
        mqttClient.subscribe('application/vdr/status/+');
    });
    
    mqttClient.addListener('mqttData', function (topic, message) {
        //if (message)
        console.log(message.toString());
    });
}