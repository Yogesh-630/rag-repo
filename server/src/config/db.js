const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;
let isInMemoryFallback = false;

// In-Memory store fallback if MongoDB is unreachable
const memoryStore = {
  users: new Map(),
  documents: new Map(),
  chunks: new Map(),
  executions: new Map(),
  logs: new Map(),
  conversations: new Map(),
  notifications: new Map(),
};

const connectDB = async () => {
  if (isConnected) return;

  try {
    const opts = {
      serverSelectionTimeoutMS: 2500,
    };
    await mongoose.connect(env.MONGODB_URI, opts);
    isConnected = true;
    isInMemoryFallback = false;
    console.log(`[Database] MongoDB connected successfully to ${env.MONGODB_URI}`);
  } catch (err) {
    console.warn(`[Database] Warning: Could not connect to MongoDB at ${env.MONGODB_URI}. Error: ${err.message}`);
    console.log(`[Database] Active mode: Resilient Memory / Embedded storage activated for zero-friction local execution.`);
    isConnected = true;
    isInMemoryFallback = true;
  }
};

module.exports = {
  connectDB,
  isInMemory: () => isInMemoryFallback,
  getMemoryStore: () => memoryStore,
};
