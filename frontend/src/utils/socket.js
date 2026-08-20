import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (role) => {
  if (socket) return socket;
  socket = io('/', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (role === 'kitchen') socket.emit('join-kitchen');
    if (role === 'manager' || role === 'admin') {
      socket.emit('join-manager');
      socket.emit('join-admin');
    }
  });
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', () => {});
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
