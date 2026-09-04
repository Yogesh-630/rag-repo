const DocumentChunk = require('../models/DocumentChunk');
const { isInMemory, getMemoryStore } = require('../config/db');

// In-Memory Fast Vector Index
class VectorIndex {
  constructor() {
    this.vectors = new Map(); // vectorId -> { id, docId, content, pageNumber, embedding, metadata }
  }

  insert(id, docId, content, pageNumber, embedding, metadata) {
    this.vectors.set(id, {
      id,
      docId,
      content,
      pageNumber,
      embedding,
      metadata: metadata || {},
    });
  }

  deleteByDocId(docId) {
    const docIdStr = docId.toString();
    for (const [id, item] of this.vectors.entries()) {
      if (item.docId.toString() === docIdStr) {
        this.vectors.delete(id);
      }
    }
  }

  clear() {
    this.vectors.clear();
  }

  size() {
    return this.vectors.size;
  }

  /**
   * Cosine Similarity calculation between two normalized vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search for top-K vectors matching queryEmbedding
   * @param {Array<number>} queryEmbedding
   * @param {Object} options - { topK, category, department }
   * @returns {Array<Object>}
   */
  search(queryEmbedding, options = {}) {
    const topK = options.topK || 4;
    const filterCategory = options.category;
    const filterDepartment = options.department;

    const scored = [];

    for (const item of this.vectors.values()) {
      if (filterCategory && filterCategory !== 'All' && item.metadata.category !== filterCategory) {
        continue;
      }
      if (filterDepartment && filterDepartment !== 'All' && item.metadata.department !== filterDepartment) {
        continue;
      }

      const score = this.cosineSimilarity(queryEmbedding, item.embedding);
      scored.push({
        ...item,
        score: Math.min(Math.max(score, 0), 1),
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

const vectorIndexInstance = new VectorIndex();

// Re-populate index from DB if needed
const syncFromDatabase = async () => {
  try {
    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      for (const [id, chunk] of memoryStore.chunks.entries()) {
        vectorIndexInstance.insert(
          id,
          chunk.docId,
          chunk.content,
          chunk.pageNumber,
          chunk.embedding,
          chunk.metadata
        );
      }
      return vectorIndexInstance.size();
    }

    const chunks = await DocumentChunk.find({});
    for (const chunk of chunks) {
      vectorIndexInstance.insert(
        chunk._id.toString(),
        chunk.docId.toString(),
        chunk.content,
        chunk.pageNumber,
        chunk.embedding,
        chunk.metadata
      );
    }
    return vectorIndexInstance.size();
  } catch (err) {
    console.warn(`[VectorDB] Sync warning: ${err.message}`);
    return vectorIndexInstance.size();
  }
};

const insertChunkVector = async (chunkId, docId, content, pageNumber, embedding, metadata) => {
  vectorIndexInstance.insert(chunkId.toString(), docId.toString(), content, pageNumber, embedding, metadata);
};

const deleteVectorsByDocId = async (docId) => {
  vectorIndexInstance.deleteByDocId(docId);
};

const similaritySearch = async (queryEmbedding, options = {}) => {
  return vectorIndexInstance.search(queryEmbedding, options);
};

const getVectorStats = async () => {
  return {
    totalVectors: vectorIndexInstance.size(),
    dimensions: 1536,
    engine: 'CollegeRAG Cosine Memory Index / Chroma Compatible',
    status: 'healthy',
  };
};

module.exports = {
  vectorIndexInstance,
  insertChunkVector,
  deleteVectorsByDocId,
  similaritySearch,
  getVectorStats,
  syncFromDatabase,
};
