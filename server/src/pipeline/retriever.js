const { embedText } = require('./embedder');
const { similaritySearch } = require('../services/vectorDbService');
const env = require('../config/env');

/**
 * Hybrid Vector Search + BM25-style Keyword Re-Ranking
 * @param {string} query
 * @param {Object} options - { category, department, topK, threshold }
 * @returns {Promise<{chunks: Array<Object>, topScore: number, isConfident: boolean, queryEmbedding: Array<number>}>}
 */
const retrieveRelevantContext = async (query, options = {}) => {
  const topK = options.topK || env.TOP_K_CHUNKS || 4;
  const threshold = options.threshold !== undefined ? options.threshold : env.SIMILARITY_THRESHOLD || 0.70;

  // 1. Embed query
  const { embedding: queryEmbedding } = await embedText(query);

  // 2. Vector similarity search
  const vectorResults = await similaritySearch(queryEmbedding, {
    topK: topK * 3, // Candidate pool
    category: options.category,
    department: options.department,
  });

  if (!vectorResults || vectorResults.length === 0) {
    return {
      chunks: [],
      topScore: 0,
      isConfident: false,
      queryEmbedding,
    };
  }

  // 3. Robust Keyword & Entity Matching
  const stopWords = new Set([
    'what', 'is', 'the', 'for', 'and', 'in', 'of', 'to', 'a', 'an', 'are', 'how', 'much',
    'can', 'i', 'get', 'on', 'with', 'at', 'by', 'this', 'that', 'there', 'from', 'or', 'do', 'does'
  ]);
  
  const rawTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  const significantTerms = rawTerms.filter(w => !stopWords.has(w));
  const queryTerms = significantTerms.length > 0 ? significantTerms : rawTerms;

  const reRanked = vectorResults.map((item) => {
    const contentLower = item.content.toLowerCase();
    
    // Keyword hits
    let matchedTerms = 0;
    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        matchedTerms++;
      }
    }

    const keywordRatio = queryTerms.length > 0 ? (matchedTerms / queryTerms.length) : 0;
    
    // Check for exact multi-word phrases (e.g. "computer science", "hostel rules", "tuition fee")
    let phraseBonus = 0;
    for (let i = 0; i < queryTerms.length - 1; i++) {
      const phrase = `${queryTerms[i]} ${queryTerms[i+1]}`;
      if (contentLower.includes(phrase)) {
        phraseBonus += 0.15;
      }
    }

    // Hybrid score calculation:
    // If significant keywords match (>50%), give high confidence boost
    let hybridScore;
    if (keywordRatio >= 0.5) {
      hybridScore = (item.score * 0.4) + (keywordRatio * 0.5) + phraseBonus + 0.15;
    } else if (keywordRatio > 0) {
      hybridScore = (item.score * 0.5) + (keywordRatio * 0.4) + phraseBonus;
    } else {
      hybridScore = item.score * 0.3; // Penalize if zero keywords matched
    }

    const finalScore = Math.min(Math.max(hybridScore, 0.0), 0.99);

    return {
      chunkId: item.id,
      docId: item.docId,
      fileName: item.metadata.fileName || 'Institutional Document',
      pageNumber: item.pageNumber || 1,
      category: item.metadata.category || 'General',
      department: item.metadata.department || 'All',
      content: item.content,
      score: parseFloat(finalScore.toFixed(4)),
    };
  });

  // Sort by hybrid score descending
  reRanked.sort((a, b) => b.score - a.score);
  const topChunks = reRanked.slice(0, topK);
  const topScore = topChunks.length > 0 ? topChunks[0].score : 0;
  const isConfident = topScore >= threshold;

  return {
    chunks: topChunks,
    topScore,
    isConfident,
    queryEmbedding,
  };
};

module.exports = {
  retrieveRelevantContext,
};
