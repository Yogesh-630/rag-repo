const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema(
  {
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    vectorId: {
      type: String,
      index: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      fileName: String,
      category: String,
      department: String,
      uploadTimestamp: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', documentChunkSchema);
