const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on('join_execution_room', (executionId) => {
      if (executionId) {
        socket.join(`exec_${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined room exec_${executionId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitToAll = (event, data) => {
  if (io) io.emit(event, data);
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToExecution = (executionId, event, data) => {
  if (io && executionId) {
    io.to(`exec_${executionId}`).emit(event, data);
  }
};

const emitExecutionStep = (executionId, stepData) => {
  emitToAll('execution_step', { executionId, ...stepData });
  emitToExecution(executionId, 'execution_step', stepData);
};

const emitStreamToken = (executionId, token) => {
  emitToAll('stream_token', { executionId, token });
  emitToExecution(executionId, 'stream_token', { token });
};

const emitDocProgress = (docId, progressData) => {
  emitToAll('doc_progress', { docId, ...progressData });
};

module.exports = {
  initSocket,
  getIO,
  emitToAll,
  emitToUser,
  emitToExecution,
  emitExecutionStep,
  emitStreamToken,
  emitDocProgress,
};
