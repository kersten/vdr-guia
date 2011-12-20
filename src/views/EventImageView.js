var http = require('http');

var EventImageView = {
    url: '/events/image/:eventid/:imageid',
    func: function (req, res) {
        if (req.session.loggedIn) {
            var http_client = http.createClient(vdr.restfulPort, vdr.host);
            var image_get_request = http_client.request('GET', '/events/image/' + req.params.eventid + '/' + req.params.imageid, {
                "Host": vdr.host + ':' + vdr.restfulPort,
                "User-Agent": 'Firefox/7.0.1',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            });

            image_get_request.addListener('response', function (proxy_response) {
                var current_byte_index = 0;
                var response_content_length = parseInt(proxy_response.header("Content-Length"));
                var response_body = new Buffer(response_content_length);

                proxy_response.setEncoding('binary');
                proxy_response.addListener('data', function (chunk) {
                    response_body.write(chunk, current_byte_index, "binary");
                    current_byte_index += chunk.length;
                });
                proxy_response.addListener('end', function () {
                    res.contentType('image/png');
                    res.send(response_body);
                });
            });

            image_get_request.end();
        } else {
            res.status(403);
        }
    }
};

module.exports = EventImageView;