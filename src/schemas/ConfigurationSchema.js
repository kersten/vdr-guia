var ConfigurationSchema = new Schema({
    socalizeKey: {
        type: String,
        unique: true
    },
    socalize: Boolean,
    vdrHost: String,
    restfulPort: Number
});

mongoose.model('Configuration', ConfigurationSchema);