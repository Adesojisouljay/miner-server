import User from '../models/Users.js';
import SupportChat from '../models/SupportChat.js';

export default (io) => {
    const supportNamespace = io.of('/api/support');

    supportNamespace.on('connection', (socket) => {
        console.log('A user connected to customer support:', socket.id);

        socket.on('createSupportSession', async ({ userId }) => {
            try {
                const user = await User.findById(userId);

                if (!user) {
                    console.error('User not found');
                    return;
                }

                const chatSession = new SupportChat({
                    userId: userId,
                    messages: [],
                });

                await chatSession.save();
                console.log(`Created new chat session with ID ${chatSession._id}`);
                
                socket.emit('sessionCreated', { chatSessionId: chatSession._id });
            } catch (error) {
                console.error('Error creating support session:', error);
            }
        });

        socket.on('joinSupportSession', async ({ userId, chatSessionId }) => {
            console.log('User ID:', userId);
            console.log('Chat Session ID:', chatSessionId);

            try {
                const user = await User.findById(userId);
                if (!user) {
                    console.error('User not found');
                    return;
                }

                const role = user.role;
                console.log(`${role} with ID ${userId} joined session ${chatSessionId}`);

                let chatSession = await SupportChat.findById(chatSessionId);
                if (!chatSession) {
                    console.error('Chat session not found');
                    return;
                }

                socket.join(chatSession._id);
                socket.emit('previousMessages', chatSession.messages);

                if (role === 'support-agent' && !chatSession.agentId) {
                    chatSession.agentId = userId;
                    await chatSession.save();
                    console.log(`Assigned agent ${userId} to session ${chatSession._id}`);
                }

                supportNamespace.to(chatSession._id).emit('userJoined', { userId, role });
            } catch (error) {
                console.error('Error joining support session:', error);
            }
        });

        socket.on('supportMessage', async ({ text, sender, chatSessionId }) => {
            try {
                console.log('Received support message:', text);

                const chatSession = await SupportChat.findById(chatSessionId);
                if (chatSession) {
                    chatSession.messages.push({ sender, text });
                    await chatSession.save();
                }

                supportNamespace.to(chatSessionId).emit('supportMessage', { sender, text });
            } catch (error) {
                console.error('Error handling support message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected from customer support:', socket.id);
        });
    });
};
