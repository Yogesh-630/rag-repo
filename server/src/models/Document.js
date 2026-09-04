const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'scanned_pdf', 'unknown'],
      default: 'pdf',
    },
    category: {
      type: String,
      enum: ['Admissions', 'Fees', 'Exams', 'Hostel', 'Placements', 'Curriculum', 'Scholarships', 'General'],
      default: 'General',
    },
    department: {
      type: String,
      default: 'All',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['processing', 'indexed', 'failed'],
      default: 'processing',
    },
    ocrApplied: {
      type: Boolean,
      default: false,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
