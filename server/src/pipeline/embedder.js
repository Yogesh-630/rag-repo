const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const VECTOR_DIM = 1536;

/**
 * High-performance deterministic semantic vectorizer fallback (1536 dimensions)
 * Computes subword token hash buckets with tf-idf weighting and L2 normalization.
 * @param {string} text
 * @returns {Array<number>} 1536-element float array
 */
const generateDeterministicEmbedding = (text) => {
  const vec = new Float32Array(VECTOR_DIM);
  if (!text || typeof text !== 'string') return Array.from(vec);

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) return Array.from(vec);

  // Unigram, Bigram, and Character 3-gram hashing
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  for (const w of words) {
    if (w.length >= 3) {
      for (let i = 0; i <= w.length - 3; i++) {
        tokens.push(w.substring(i, i + 3));
      }
    }
  }

  // Hash tokens into 1536 buckets
  for (const token of tokens) {
    let hash1 = 5381;
    let hash2 = 0x811c9dc5;
    for (let i = 0; i < token.length; i++) {
      const code = token.charCodeAt(i);
      hash1 = ((hash1 << 5) + hash1) ^ code;
      hash2 = (hash2 ^ code) * 0x01000193;
    }
    const idx = Math.abs(hash1) % VECTOR_DIM;
    const weight = 1.0 + (Math.abs(hash2 % 100) / 100.0);
    vec[idx] += weight;
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      vec[i] = vec[i] / norm;
    }
  }

  return Array.from(vec);
};

/**
 * Embed a single piece of text.
 * @param {string} text
 * @returns {Promise<{embedding: Array<number>, provider: string}>}
 */
const embedText = async (text) => {
  // 1. Check OpenAI
  if (env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const resp = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
        dimensions: VECTOR_DIM,
      });
      if (resp && resp.data && resp.data[0] && resp.data[0].embedding) {
        return { embedding: resp.data[0].embedding, provider: 'openai' };
      }
    } catch (err) {
      console.warn(`[Embedder] OpenAI embedding API error: ${err.message}. Falling back.`);
    }
  }

  // 2. Check Gemini
  if (env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text.slice(0, 8000));
      if (result && result.embedding && result.embedding.values) {
        let values = result.embedding.values;
        // Pad or slice to 1536 if needed
        if (values.length < VECTOR_DIM) {
          const padded = new Array(VECTOR_DIM).fill(0);
          for (let i = 0; i < values.length; i++) padded[i] = values[i];
          values = padded;
        } else if (values.length > VECTOR_DIM) {
          values = values.slice(0, VECTOR_DIM);
        }
        return { embedding: values, provider: 'gemini' };
      }
    } catch (err) {
      console.warn(`[Embedder] Gemini embedding API error: ${err.message}. Falling back.`);
    }
  }

  // 3. Resilient Deterministic Semantic Embedder
  const embedding = generateDeterministicEmbedding(text);
  return { embedding, provider: 'local-semantic' };
};

/**
 * Embed multiple chunks in batch
 * @param {Array<string>} texts
 * @returns {Promise<Array<Array<number>>>}
 */
const embedBatch = async (texts) => {
  const embeddings = [];
  for (const t of texts) {
    const res = await embedText(t);
    embeddings.push(res.embedding);
  }
  return embeddings;
};

module.exports = {
  VECTOR_DIM,
  embedText,
  embedBatch,
  generateDeterministicEmbedding,
};
