var ActorSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    
    character: {
        type: String,
        required: false
    }
});

mongoose.model('Actor', ActorSchema);