const mongoose = require('mongoose');

const retrievedChunkSchema = new mongoose.Schema(
  {
    chunkId: String,
    docId: String,
    fileName: String,
    pageNumber: Number,
    category: String,
    department: String,
    score: Number,
    content: String,
  },
  { _id: false }
);

const queryExecutionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      default: '',
    },
    retrievedChunks: [retrievedChunkSchema],
    topSimilarityScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    tokenUsage: {
      promptTokens: { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    feedback: {
      type: String,
      enum: ['upvote', 'downvote', 'none'],
      default: 'none',
    },
    feedbackComment: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: 'local-semantic',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.QueryExecution || mongoose.model('QueryExecution', queryExecutionSchema);
