var ActorSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    character: {
        type: String,
        required: false
    },

    tmdbId: {
        type: Schema.ObjectId,
        ref: 'MovieDetail',
        required: false
    }
});

ActorSchema.index({name: 1, character: -1}, {unique: true});

mongoose.model('Actor', ActorSchema);