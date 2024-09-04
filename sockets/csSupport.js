export default (io) => {
    const supportNamespace = io.of('/support');

    supportNamespace.on('connection', (socket) => {
        console.log('A user connected to customer support:', socket.id);

        socket.on('supportMessage', (msg) => {
            supportNamespace.emit('supportMessage', msg);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected from customer support:', socket.id);
        });
    });
};
