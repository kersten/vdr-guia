var ActorDetailSchema = new Schema({
    actors: {
        type: Schema.ObjectId,
        ref: 'Actor',
        required: false
    },
});

mongoose.model('ActorDetail', ActorDetailSchema);