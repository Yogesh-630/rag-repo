const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { connectDB, isInMemory } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initIngestionQueue } = require('./queues/ingestionQueue');
const { processDocumentIngestion } = require('./services/documentService');
const { syncFromDatabase, getVectorStats } = require('./services/vectorDbService');
const { seedDatabase } = require('./seeds/seedData');
const { getSupabase } = require('./config/supabase');

// Route imports
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const executionRoutes = require('./routes/executionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, env.CLIENT_URL);

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const vectorStats = await getVectorStats();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'CollegeRAG_AI Operations Backend',
    version: '1.0.0',
    database: isInMemory() ? 'in-memory-resilient' : 'mongodb',
    vectorDb: vectorStats,
    uptimeSeconds: Math.floor(process.uptime()),
    aiProviders: {
      openai: Boolean(env.OPENAI_API_KEY),
      gemini: Boolean(env.GEMINI_API_KEY),
      fallbackMode: !env.OPENAI_API_KEY && !env.GEMINI_API_KEY,
    },
    supabase: {
      configured: Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)),
      projectUrl: env.SUPABASE_URL || 'Not Configured',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // 1. Connect DB
    await connectDB();

    // 1b. Initialize Supabase if configured
    getSupabase();

    // 2. Initialize Queue
    initIngestionQueue(processDocumentIngestion);

    // 3. Sync or Auto-seed knowledge base
    const vectorCount = await syncFromDatabase();
    if (vectorCount === 0) {
      console.log('[Server] No vectors found in index. Auto-seeding official college documents...');
      await seedDatabase();
    }

    server.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CollegeRAG_AI Server running on port ${env.PORT}`);
      console.log(`📡 Client URL: ${env.CLIENT_URL}`);
      console.log(`🔗 Health Check: http://localhost:${env.PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
