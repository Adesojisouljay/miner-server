import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const P2pChat = mongoose.model('P2pChat', chatSchema);
export default P2pChat;
