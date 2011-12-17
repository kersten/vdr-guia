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

mongoose.model('Logo', LogoSchema);