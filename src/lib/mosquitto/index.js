var sys = require('sys'),
    net = require('net'),
    inspect = require("util").inspect,
    EventEmitter = require('events').EventEmitter;

MQTT_PUBLISH = 3;
MQTT_PINGREG = 12;

var connect = function (host, port, id) {
    this.host = host;
    this.port = port;
    
    this.connected = false;
    this.sessionSend = false;
    this.sessionOpened = false;
    this.id = id;
    
    //this.conn = net.createConnection(port, host);
    this.conn = new net.Socket();
    this.conn.connect(port, host);
    this.conn.setEncoding('binary');
    
    var self = this;
    
    //Set timer
    self.timeout = setTimeout(function() {
        self.timeUp();
    }, 25000);
    
    self.conn.addListener('connect', function () {
        console.log('Connected to mosquitto on: ' + self.host + ':' + self.port);
        self.connected = true;
        
        //Once connected, send open stream to broker
        self.openSession();
    });
    
    self.conn.addListener('data', function (data) {
        if (!self.sessionOpened) {
            if (data.length == 4 && data.charCodeAt(3) == 0) {
                self.sessionOpened = true;
                self.emit('sessionOpened');
            }
        } else {
            if(data.length > 2){
                sys.log(inspect(data));
                var buf = new Buffer(data, 'binary');
                self.processData(buf);
            }
        }
    });
};

sys.inherits(connect, EventEmitter);

connect.prototype.openSession = function () {
    var buffer = new Buffer(16 + this.id.length);
    var i = 0;
    
    // MQTT Connect header
    buffer[i++] = 0x10;
    buffer[i++] = 14 + this.id.length;
    
    // MQTT Connect variable header
    buffer[i++] = 0x00; // Byte 1 Length MSB (0)
    buffer[i++] = 0x06; // Byte 2 Length LSB (6)
    buffer[i++] = 0x4d; // Byte 3 M
    buffer[i++] = 0x51; // Byte 4 Q
    buffer[i++] = 0x49; // Byte 5 I
    buffer[i++] = 0x73; // Byte 6 s
    buffer[i++] = 0x64; // Byte 7 d
    buffer[i++] = 0x70; // Byte 8 p
    buffer[i++] = 0x03; // Byte 9 Protocol Version Number
    buffer[i++] = 0x02; // Byte 10 Connect Flags
    buffer[i++] = 0x00; // Byte 11 Keep Alive MSB (0)
    buffer[i++] = 0x10; // Byte 12 Keep Alive LSB (10)
    
    buffer[i++] = 0x00; // Header end
    
    // Payload
    buffer[i++] = this.id.length // Payload length
    
    for (var n = 0; n < this.id.length; n++) { 
        buffer[i++] = this.id.charCodeAt(n); // Convert string to utf8
    }
    
    this.conn.write(buffer, "utf8");
};

connect.prototype.processData = function (data) {
    // Evaluate type
    switch (data[0]>>4) {
    case MQTT_PUBLISH:
        console.log('Publish stream received');
        
        var header = data[0];
        
        var multiplier = 1;
        var value = 0;
        
        var remaining = 0;
        
        var cnt = 1;
        
        do {
            remaining++;
            
            if (remaining > 4) {
                throw "Protocol Error"
            }
            
            digit = data[cnt];
            value += (digit & 127) * multiplier;
            multiplier *= 128;
            cnt++;
        } while ((digit & 128) != 0);
            
        console.log('remaining length: ' + value);
        console.log('next byte: ' + cnt);
        
        var topicLength = data[cnt++] + data[cnt++];
        var topic = new Buffer(topicLength);
        
        console.log('Topic length: ' + topicLength);
        
        for (var i = 0; i < topicLength; i++) {
            topic[i] = data[i + cnt];
        }
        
        cnt++;
        
        var variableHeaderLength = topicLength + cnt++;
        
        var messageLength = data[1] - variableHeaderLength - 2;
        var message = new Buffer(messageLength);
        
        console.log("Topic: " + topic);
        
        var payload = data.slice(variableHeaderLength + 2, data.length);
        
        console.log("Message: " + payload);
        
        break;
    
    case MQTT_PINGREG:
        console.log('Pringreg stream received');
        
        var buffer = new Buffer(2);
        
        buffer[0] = 0xd0;
        buffer[1] = 0x00;
        
        this.conn.write(buffer, "utf8");
        
        var cc = this;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            cc.timeUp();
        }, 25000);
        break;
    }
};

connect.prototype.subscribe = function (topic, cb) {
    var i = 0;
    var buffer = new Buffer(7 + topic.length);

    //fixed header
    buffer[i++] = 0x80;
    buffer[i++] = 5 + topic.length;

    //varibale header
    buffer[i++] = 0x00;
    buffer[i++] = 0x0a; //message id

    //payload
    buffer[i++] = 0x00;
    buffer[i++] = topic.length;
	
    for (var n = 0; n < topic.length; n++) {
        buffer[i++] = topic.charCodeAt(n);
    }
    
    buffer[i++] = 0x00;
    
    console.log('Subcribe to: ' + topic);
    
    this.conn.write(buffer, "utf8");
};

connect.prototype.timeUp = function () {
    if(this.connected && this.sessionOpened){
        //sys.puts('25s keep alive');
        this.live();
    } else if (!this.connected ){
        sys.puts('MQTT connect to server time out');
        this.emit("connectTimeOut");
    } else {
        sys.puts('Unknow state');
    }
};

connect.prototype.live = function () {
	//Send [192, 0] to server
    var packet192 = new Buffer(2);
    packet192[0] = 0xc0;
    packet192[1] = 0x00;
    this.conn.write(packet192, "utf8");
    
    //reset timer
    var cc = this;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(function() {
        cc.timeUp();
        //self.publish('node', 'hello wtf');
    }, 25000); //send keepavie every 25s
};

module.exports.connect = connect;