var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    event_id: {
        type: String,
        required: true
    },

    channel_id: {
        type: Schema.ObjectId,
        ref: 'Channel',
        required: true
    },

    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: false
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

    start_time: {
        type: String,
        required: false
    },

    stop: {
        type: Number,
        required: false
    },

    duration: {
        type: Number,
        required: true
    },

    actors: [{
        type: Schema.ObjectId,
        ref: 'Actor'
    }],

    Regisseur: {
        type: String,
        required: false
    },

    tmdbId: {
        type: Schema.ObjectId,
        ref: 'MovieDetail',
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

EventSchema.index({event_id: 1, channel_id: 1}, {unique: true});
EventSchema.index({timer_id: 1});

mongoose.model('Event', EventSchema);