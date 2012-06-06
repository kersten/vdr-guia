var hookio = require('hook.io');

var hook = hookio.createHook({
    name: "a"
});

hook.on('*::sup', function (data) {
    // outputs b::sup::dog
    console.log(this.event + ' ' + data);
});

hook.start();