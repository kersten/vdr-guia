var ChannelSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    
    number: {
        type: Number,
        required: true
    },
    
    channel_id: {
        type: String,
        required: true,
        unique: true
    },
    
    image: {
        type: Boolean,
        required: true
    },
    
    group: {
        type: String,
        required: false
    },
    
    transponder: {
        type: Number,
        required: false
    },
    
    stream: {
        type: String,
        required: false
    },
    
    is_atsc: {
        type: Boolean,
        required: true
    },
    
    is_cable: {
        type: Boolean,
        required: true
    },
    
    is_terr: {
        type: Boolean,
        required: true
    },
    
    is_sat: {
        type: Boolean,
        required: true
    },
    
    is_radio: {
        type: Boolean,
        required: true
    }
});

mongoose.model('Channel', ChannelSchema);