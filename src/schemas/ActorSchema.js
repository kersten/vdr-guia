var ActorSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

mongoose.model('Actor', ActorSchema);