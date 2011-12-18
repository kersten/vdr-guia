var ConfigurationSchema = new Schema({
    socalizeKey: {
        type: String,
        unique: true
    },
    socalize: Boolean,
    vdrHost: String,
    restfulPort: Number,
    epgscandelay: {
        type: Number,
        required: false
    }
});

mongoose.model('Configuration', ConfigurationSchema);