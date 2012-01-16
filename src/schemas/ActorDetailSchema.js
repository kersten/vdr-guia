var ActorDetailSchema = new Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    }
});

mongoose.model('ActorDetail', ActorDetailSchema);