var EventSchema = new Schema({
    
    title: {
        type: String,
        required: true
    },
    
    category: {
        type: String,
        required: true
    },
    
    genre: {
        type: String,
        required: true
    }
    
});

module.exports = mongoose.model('Event', EventSchema);