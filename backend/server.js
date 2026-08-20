const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Make io accessible in controllers
app.set('io', io);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-kitchen', () => {
    socket.join('kitchen');
    console.log(`Socket ${socket.id} joined kitchen room`);
  });

  socket.on('join-manager', () => {
    socket.join('manager');
    console.log(`Socket ${socket.id} joined manager room`);
  });

  socket.on('join-admin', () => {
    socket.join('admin');
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
