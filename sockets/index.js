import { Server } from 'socket.io';
import merchantStatus from './merchant.js';
import supportChat from './csSupport.js';

export const initializeSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    merchantStatus(io);
    supportChat(io);

    return io;
};

