const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('signal', (payload) => {
      io.to(payload.to).emit('signal', {
        signal: payload.signal,
        from: payload.from,
      });
    });

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });

    socket.on('chat-message', (message) => {
      io.to(roomId).emit('chat-message', message);
    });

    socket.on('drawing', (data) => {
      io.to(roomId).emit('drawing', data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
