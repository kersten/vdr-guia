var crypto = require('crypto');

module.exports = function (msg, key) {
    return crypto.createHmac('sha256', key).update(msg).digest('hex');
}