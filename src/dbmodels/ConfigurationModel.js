var ConfigurationSchema = new Schema({
    user: {type: String, lowercase: true},
    password: String,
    socalizeKey: String,
    socalize: Boolean
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);