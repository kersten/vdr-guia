var http = require('http'),
httpGetOptions = {
    host: 'www.imdbapi.com', 
    port: 80, 
    path:''
},
regString = '\\[.+\\]|\\(.+\\)|\\{.+\\}|\s{,2}|dvdrip|xvid|hdtv|deity|gesp|thewretched|metis|riprg|bluray|720p|subs|release|bdrip|imbt|toxic3|ac3|5\,1|hustle|noir|dmt|kln|lw|lol|done|dvix|x264|gopo|btarena|mp3|dvdscr|maxspeed|avi|srt|babies|unrated|burger|arigold|coalition|h264|aac|defaced|dvdr|divxnl-team|divx|nlt|nl|orc|fxg|stv|axxo|saphire|devise|practice|alliance|dutch|amiable|diamond';
    
fs.readdir(process.cwd(), function(err, data) {
    if (err) throw err;

    data.forEach(function(file, index) {
        getImdbData(file);
    });

});

var getImdbData = function(file) {
    file = file.replace(new RegExp(regString, 'gi'), '').replace(/\.|\-/g, ' ').trim();
  
    if (file.length > 0) {
    
        httpGetOptions.path = '/?t=' + encodeURIComponent(file);
        http.get(httpGetOptions, function(res) {
      
            var data = '';
            res.on('data', function(chunck) {
                data += chunck.toString();
            });
      
            res.on('end', function() {
                var result = JSON.parse(data.toString());
      
                if (result['Response'] == undefined || result['Response'] == 'Parse Error')
                    console.log('No result for: ' + file);
                else {
                    var rating = parseFloat(result['Rating']),
                    color = [];
          
                    if (rating >= 8)
                        color = [33, 39];
                    else if (rating >= 6 && rating < 8)
                        color = [32, 39];
                    else
                        color = [31, 39];

                    console.log('\033[' + color[0] + 'm' + result['Rating'] + '\033[' + color[1] + 'm - ' + result['Title'] + ' (' + result['Genre'] + ')');
                }
            });
      
        });
    }
};