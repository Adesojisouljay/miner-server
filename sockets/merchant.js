import Merchant from '../models/Merchant.js';
import P2pChat from '../models/p2pChat.js';
import NairaDepositRequest from '../models/FiatDeposit.js';

export default (io) => {
    const p2pChatNamespace = io.of('/api/chat');

    p2pChatNamespace.on('connection', (socket) => {
        const { merchantId, userId } = socket.handshake.query;

        if (merchantId && userId) {
            const roomId = `${merchantId}-${userId}`;
            socket.join(roomId);
            console.log(`User ${userId} and Merchant ${merchantId} joined room ${roomId}`);

            socket.on('depositMade', async (depositRequest) => {
                try {
                    p2pChatNamespace.to(roomId).emit('newDeposit', depositRequest);
                } catch (error) {
                    p2pChatNamespace.to(roomId).emit('error', { message: 'Error creating deposit request', error });
                }
            });

            socket.on('depositConfirmed', async (depositId) => {
                try {
                    const depositRequest = await NairaDepositRequest.findById(depositId);
                    if (depositRequest) {
                        depositRequest.status = 'completed';
                        await depositRequest.save();
                        p2pChatNamespace.to(roomId).emit('depositConfirmed', depositRequest);
                    } else {
                        p2pChatNamespace.to(roomId).emit('error', { message: 'Deposit request not found' });
                    }
                } catch (error) {
                    p2pChatNamespace.to(roomId).emit('error', { message: 'Error confirming deposit', error });
                }
            });

            socket.on('depositCanceled', async (depositId) => {
                try {
                    const depositRequest = await NairaDepositRequest.findById(depositId);
                    if (depositRequest) {
                        depositRequest.status = 'canceled';
                        await depositRequest.save();
                        p2pChatNamespace.to(roomId).emit('depositCanceled', depositRequest);
                    } else {
                        p2pChatNamespace.to(roomId).emit('error', { message: 'Deposit request not found' });
                    }
                } catch (error) {
                    p2pChatNamespace.to(roomId).emit('error', { message: 'Error canceling deposit', error });
                }
            });

            Merchant.findByIdAndUpdate(merchantId, { online: true }, { new: true })  
                .then(merchant => {
                    if (merchant) {
                        console.log(`Merchant ${merchant.username} is online`);
                    }
                })
                .catch(err => {
                    console.error('Error updating merchant status:', err);
                });

            P2pChat.find({ roomId })
                .sort({ timestamp: 1 })
                .then(messages => {
                    socket.emit('loadHistory', messages);
                })
                .catch(err => {
                    console.error('Error loading chat history:', err);
                });

            socket.on('sendMessage', (data) => {
                const { message, sender } = data;
                console.log(`Message from ${sender} in room ${roomId}: ${message}`);

                const newMessage = new P2pChat({ roomId, sender, message });
                newMessage.save()
                    .then(() => {
                        p2pChatNamespace.to(roomId).emit('receiveMessage', { message, sender });
                    })
                    .catch(err => {
                        console.error('Error saving message:', err);
                    });
            });

            socket.on('disconnect', () => {
                Merchant.findByIdAndUpdate(merchantId, { online: false }, { new: true })
                    .then(merchant => {
                        if (merchant) {
                            console.log(`Merchant ${merchant.username} is offline`);
                        }
                    })
                    .catch(err => {
                        console.error('Error updating merchant status:', err);
                    });

                console.log(`User ${userId} or Merchant ${merchantId} disconnected`);
            });
        } else {
            console.warn('User or Merchant connected without necessary IDs');
            socket.disconnect();
        }
    });
};

