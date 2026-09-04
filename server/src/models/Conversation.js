const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema(
  {
    docId: String,
    fileName: String,
    pageNumber: Number,
    category: String,
    department: String,
    score: Number,
    snippet: String,
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: [citationSchema],
    score: {
      type: Number,
      default: 0,
    },
    executionId: {
      type: String,
    },
    feedback: {
      type: String,
      enum: ['upvote', 'downvote', 'none'],
      default: 'none',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New College Inquiry',
      trim: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
