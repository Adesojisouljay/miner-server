import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
});

const supportChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [messageSchema],
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const SupportChat = mongoose.model('SupportChat', supportChatSchema);

export default SupportChat;
