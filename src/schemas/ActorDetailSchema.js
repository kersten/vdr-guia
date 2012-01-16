var ActorDetailSchema = new Schema({
    tmdbid: {
        type: Number,
        required: true,
        unique: true
    }
});

mongoose.model('ActorDetail', ActorDetailSchema);