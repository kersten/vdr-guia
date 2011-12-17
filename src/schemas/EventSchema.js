var ActorSchema = require('./ActorSchema');

var EventSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    
    event_id: {
        type: String,
        required: true
    },
    
    channel_id: {
        type: String,
        required: true
    },
    
    title: {
        type: String,
        required: true
    },
    
    short_description: {
        type: String,
        required: false
    },
    
    description: {
        type: String,
        required: false
    },
    
    start: {
        type: Number,
        required: true
    },
    
    stop: {
        type: Number,
        required: false
    },
    
    duration: {
        type: Number,
        required: true
    },
    
    actors: [ActorSchema],
    
    Regisseur: {
        type: String,
        required: false
    },
    
    host: {
        type: String,
        required: false
    },
    
    parental_rating: {
        type: Number,
        required: false
    },
    
    rating: {
        type: Number,
        required: false
    },
    
    country: {
        type: String,
        required: false
    },
    
    year: {
        type: String,
        required: false
    },
    
    components: [],
    
    genre: []
});

mongoose.model('Event', EventSchema);