const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { isInMemory, getMemoryStore } = require('../config/db');
const { extractDocumentText } = require('../pipeline/extractor');
const { chunkDocumentPages } = require('../pipeline/chunker');
const { embedBatch } = require('../pipeline/embedder');
const { insertChunkVector, deleteVectorsByDocId } = require('./vectorDbService');
const { emitDocProgress, emitToAll } = require('../config/socket');
const { addIngestionJob } = require('../queues/ingestionQueue');

/**
 * Process a document through the entire ingestion pipeline:
 * Extract -> Chunk -> Embed -> Index -> Update Status
 */
const processDocumentIngestion = async (jobData) => {
  const { docId, filePath, originalName, category, department, uploadedBy } = jobData;
  console.log(`[DocumentService] Starting ingestion pipeline for document: ${docId} (${originalName})`);

  try {
    // 1. Text Extraction
    emitDocProgress(docId, { status: 'processing', step: 'extraction', percentage: 20, message: 'Extracting text and scanning pages...' });
    const { pages, ocrApplied, totalCharacters } = await extractDocumentText(filePath, originalName);

    console.log(`[DocumentService] Extracted ${pages.length} pages (${totalCharacters} chars) from ${originalName}. OCR: ${ocrApplied}`);

    // 2. Document Chunking
    emitDocProgress(docId, { status: 'processing', step: 'chunking', percentage: 45, message: 'Segmenting document into semantic 800-char chunks...' });
    const chunks = chunkDocumentPages(pages, {
      docId,
      fileName: originalName,
      category,
      department,
    });

    console.log(`[DocumentService] Generated ${chunks.length} chunks for ${originalName}`);

    // 3. Batch Embeddings Generation
    emitDocProgress(docId, { status: 'processing', step: 'embedding', percentage: 70, message: 'Generating 1536-dimensional vector embeddings...' });
    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await embedBatch(chunkTexts);

    // 4. Vector DB Indexing & Document Chunk Persistence
    emitDocProgress(docId, { status: 'processing', step: 'indexing', percentage: 90, message: 'Storing vector embeddings in similarity index...' });
    
    // Purge old vectors if re-indexing
    await deleteVectorsByDocId(docId);

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      
      // Remove old chunks for this doc
      for (const [id, ch] of memoryStore.chunks.entries()) {
        if (ch.docId.toString() === docId.toString()) {
          memoryStore.chunks.delete(id);
        }
      }

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = uuidv4();
        const chunkObj = {
          _id: chunkId,
          id: chunkId,
          docId,
          content: chunks[i].content,
          pageNumber: chunks[i].pageNumber,
          chunkIndex: chunks[i].chunkIndex,
          vectorId: chunkId,
          embedding: embeddings[i],
          metadata: chunks[i].metadata,
        };
        memoryStore.chunks.set(chunkId, chunkObj);
        await insertChunkVector(chunkId, docId, chunkObj.content, chunkObj.pageNumber, chunkObj.embedding, chunkObj.metadata);
      }

      // Update doc in memory
      const doc = memoryStore.documents.get(docId);
      if (doc) {
        doc.status = 'indexed';
        doc.chunkCount = chunks.length;
        doc.ocrApplied = ocrApplied;
        doc.updatedAt = new Date();
      }
    } else {
      await DocumentChunk.deleteMany({ docId });

      const chunkDocs = chunks.map((chunk, i) => ({
        docId,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        vectorId: `${docId}_${chunk.chunkIndex}`,
        embedding: embeddings[i],
        metadata: chunk.metadata,
      }));

      const savedChunks = await DocumentChunk.insertMany(chunkDocs);
      for (const saved of savedChunks) {
        await insertChunkVector(
          saved._id.toString(),
          docId,
          saved.content,
          saved.pageNumber,
          saved.embedding,
          saved.metadata
        );
      }

      await Document.findByIdAndUpdate(docId, {
        status: 'indexed',
        chunkCount: chunks.length,
        ocrApplied,
      });
    }

    emitDocProgress(docId, {
      status: 'indexed',
      step: 'completed',
      percentage: 100,
      chunkCount: chunks.length,
      message: `Indexing complete! ${chunks.length} chunks actively searchable.`,
    });

    emitToAll('notification', {
      type: 'success',
      title: 'Knowledge Base Updated',
      message: `Document "${originalName}" has been successfully indexed with ${chunks.length} searchable chunks.`,
    });

    console.log(`[DocumentService] Document ${originalName} (${docId}) indexed successfully!`);
    return { success: true, chunkCount: chunks.length };
  } catch (err) {
    console.error(`[DocumentService] Ingestion failed for ${docId}:`, err);
    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const doc = memoryStore.documents.get(docId);
      if (doc) {
        doc.status = 'failed';
        doc.errorMessage = err.message;
      }
    } else {
      await Document.findByIdAndUpdate(docId, {
        status: 'failed',
        errorMessage: err.message,
      });
    }

    emitDocProgress(docId, {
      status: 'failed',
      step: 'error',
      percentage: 100,
      message: `Ingestion failed: ${err.message}`,
    });

    throw err;
  }
};

const createDocument = async (fileData, user) => {
  const { title, originalname, path: filePath, size, category, department } = fileData;
  const ext = path.extname(originalname).toLowerCase().replace('.', '');
  const fileType = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : ext === 'txt' ? 'txt' : 'unknown';

  let docId;
  let newDoc;

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    docId = uuidv4();
    newDoc = {
      _id: docId,
      id: docId,
      title: title || originalname,
      fileName: originalname,
      fileUrl: `/uploads/${path.basename(filePath)}`,
      filePath,
      fileType,
      category: category || 'General',
      department: department || 'All',
      uploadedBy: user.id,
      chunkCount: 0,
      version: 1,
      status: 'processing',
      ocrApplied: false,
      fileSize: size,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.documents.set(docId, newDoc);
  } else {
    const created = await Document.create({
      title: title || originalname,
      fileName: originalname,
      fileUrl: `/uploads/${path.basename(filePath)}`,
      fileType,
      category: category || 'General',
      department: department || 'All',
      uploadedBy: user._id,
      status: 'processing',
      fileSize: size,
    });
    docId = created._id.toString();
    newDoc = created;
  }

  // Enqueue background processing
  await addIngestionJob(
    {
      docId,
      filePath,
      originalName: originalname,
      category: category || 'General',
      department: department || 'All',
      uploadedBy: user.id || user._id,
    },
    processDocumentIngestion
  );

  return newDoc;
};

const listDocuments = async ({ category, department, search, status, page = 1, limit = 20 }) => {
  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    let docs = Array.from(memoryStore.documents.values());

    if (category && category !== 'All') {
      docs = docs.filter(d => d.category === category);
    }
    if (department && department !== 'All') {
      docs = docs.filter(d => d.department === department);
    }
    if (status) {
      docs = docs.filter(d => d.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => d.title.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q));
    }

    docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = docs.length;
    const paginated = docs.slice((page - 1) * limit, page * limit);

    return {
      documents: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  const query = {};
  if (category && category !== 'All') query.category = category;
  if (department && department !== 'All') query.department = department;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Document.countDocuments(query);
  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('uploadedBy', 'name email');

  return {
    documents,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getDocumentById = async (id) => {
  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    const doc = memoryStore.documents.get(id);
    if (!doc) throw new Error('Document not found');
    const chunks = Array.from(memoryStore.chunks.values()).filter(c => c.docId.toString() === id.toString());
    return { ...doc, chunks };
  }

  const document = await Document.findById(id).populate('uploadedBy', 'name email');
  if (!document) throw new Error('Document not found');
  const chunks = await DocumentChunk.find({ docId: id }).select('-embedding');
  return { ...document.toObject(), chunks };
};

const deleteDocument = async (id) => {
  // Purge vectors
  await deleteVectorsByDocId(id);

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    const doc = memoryStore.documents.get(id);
    if (!doc) throw new Error('Document not found');

    // Remove chunks
    for (const [chunkId, chunk] of memoryStore.chunks.entries()) {
      if (chunk.docId.toString() === id.toString()) {
        memoryStore.chunks.delete(chunkId);
      }
    }

    memoryStore.documents.delete(id);
    return { success: true, message: 'Document and vectors deleted successfully.' };
  }

  const doc = await Document.findByIdAndDelete(id);
  if (!doc) throw new Error('Document not found');
  await DocumentChunk.deleteMany({ docId: id });

  return { success: true, message: 'Document and vectors deleted successfully.' };
};

const reindexDocument = async (id, user) => {
  const doc = await getDocumentById(id);
  if (!doc) throw new Error('Document not found');

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    const d = memoryStore.documents.get(id);
    if (d) {
      d.status = 'processing';
    }
  } else {
    await Document.findByIdAndUpdate(id, { status: 'processing' });
  }

  await addIngestionJob(
    {
      docId: id,
      filePath: doc.filePath || path.join(__dirname, '../../uploads', path.basename(doc.fileUrl || doc.fileName)),
      originalName: doc.fileName,
      category: doc.category,
      department: doc.department,
      uploadedBy: user.id || user._id,
    },
    processDocumentIngestion
  );

  return { success: true, message: 'Re-indexing initiated.' };
};

module.exports = {
  createDocument,
  processDocumentIngestion,
  listDocuments,
  getDocumentById,
  deleteDocument,
  reindexDocument,
};
