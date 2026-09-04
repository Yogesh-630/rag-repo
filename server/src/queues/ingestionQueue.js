const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const { emitDocProgress, emitToAll } = require('../config/socket');

let ingestionQueue = null;
let ingestionWorker = null;
let useInMemoryQueue = true;

// Initialize BullMQ or fallback
const initIngestionQueue = (processJobHandler) => {
  const client = new IORedis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    connectTimeout: 1500,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  client.connect().then(() => {
    console.log(`[Queue] Redis connected successfully. BullMQ queue active.`);
    useInMemoryQueue = false;
    
    ingestionQueue = new Queue('document-ingestion', { connection: client });
    ingestionWorker = new Worker('document-ingestion', async (job) => {
      return await processJobHandler(job.data);
    }, { connection: client });

    ingestionWorker.on('completed', (job) => {
      console.log(`[Queue] BullMQ job ${job.id} completed for doc: ${job.data?.docId}`);
    });

    ingestionWorker.on('failed', (job, err) => {
      console.error(`[Queue] BullMQ job ${job?.id} failed:`, err);
    });
  }).catch((err) => {
    console.log(`[Queue] Redis not detected at ${env.REDIS_HOST}:${env.REDIS_PORT}. Active mode: Resilient In-Memory Asynchronous Job Runner.`);
    useInMemoryQueue = true;
    try {
      client.disconnect();
    } catch (_) {}
  });
};

/**
 * Add document to background ingestion queue
 * @param {Object} jobData - { docId, filePath, originalName, category, department, uploadedBy }
 * @param {Function} fallbackHandler - Function to run if Redis is not active
 */
const addIngestionJob = async (jobData, fallbackHandler) => {
  emitDocProgress(jobData.docId, {
    status: 'processing',
    step: 'queued',
    percentage: 5,
    message: 'Document queued for background ingestion',
  });

  if (!useInMemoryQueue && ingestionQueue) {
    try {
      await ingestionQueue.add('ingest-doc', jobData, {
        attempts: 2,
        backoff: { type: 'exponential', delay: 1000 },
      });
      return { queued: true, mode: 'bullmq' };
    } catch (err) {
      console.warn(`[Queue] BullMQ add error: ${err.message}. Running in async background task.`);
    }
  }

  // Resilient In-Memory Asynchronous Execution
  setTimeout(async () => {
    try {
      if (fallbackHandler) {
        await fallbackHandler(jobData);
      }
    } catch (err) {
      console.error(`[Queue] In-memory job error for doc ${jobData.docId}:`, err);
    }
  }, 100);

  return { queued: true, mode: 'in-memory-async' };
};

module.exports = {
  initIngestionQueue,
  addIngestionJob,
};
