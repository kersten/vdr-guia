var ConfigurationSchema = new Schema({
    user: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    socalizeKey: String,
    socalize: Boolean
});

module.exports = mongoose.model('Configuration', ConfigurationSchema);