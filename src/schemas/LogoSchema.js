var LogoSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    file: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Logo', LogoSchema);