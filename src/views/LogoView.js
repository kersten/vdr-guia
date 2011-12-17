var logos = mongoose.model('Logo'),
    fs = require('fs'),
    http = require('http');

var LogoView = {
    url: '/logo/*',
    func: function (req, res) {
        if (req.session.loggedIn) {
            var channel_name = unescape(req.url.substr(6)).replace(/\//, '|');
            
            logos.findOne({name: channel_name}, function (err, data) {
                try {
                    var filename = __dirname + '/../share/logos/' + data.file;
                    res.contentType(filename);
                    
                    var image = fs.readFileSync(filename);
                    
                    res.end(image);
                } catch (e) {
                    console.log('Logo ' + channel_name + ' not found, getting placeholder');
                    
                    var http_client = http.createClient(80, 'placehold.it');
                    var image_get_request = http_client.request('GET', 'http://placehold.it/240x134.png&text=' + req.url.substr(6), {
                        'Host': 'placehold.it',
                        "User-Agent": 'Firefox/7.0.1',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    });
                    
                    image_get_request.addListener('response', function(proxy_response){
                        var current_byte_index = 0;
                        var response_content_length = parseInt(proxy_response.header("Content-Length"));
                        var response_body = new Buffer(response_content_length);
                        
                        proxy_response.setEncoding('binary');
                        proxy_response.addListener('data', function(chunk){
                            response_body.write(chunk, current_byte_index, "binary");
                            current_byte_index += chunk.length;
                        });
                        proxy_response.addListener('end', function(){
                            fs.writeFile(__dirname + '/../share/logos/' + channel_name + '.png', response_body, function (err) {
                                var logoModel = new LogoSchema({
                                    file: channel_name + '.png',
                                    name: channel_name
                                });
                                
                                logoModel.save();
                            });
                            
                            res.contentType('image/png');
                            res.send(response_body);
                        });
                    });
                    
                    image_get_request.end();
                }
            });
        } else {
            res.status(403);
        }
    }
};

module.exports = LogoView;