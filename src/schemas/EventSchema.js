var ActorSchema = require('./ActorSchema');

var EventSchema = new Schema({
    event_id: {
        type: String,
        required: true,
        unique: true
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
        required: true
    },
    
    duration: {
        type: Number,
        required: true
    },
    
    actors: [ActorSchema],
    
    Regisseur: [RegisseurSchema],
    
    host: [HostSchema],
    
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
        type: Number,
        required: false
    },
    
    category: {
        type: String,
        required: false
    },
    
    genre: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Event', EventSchema);