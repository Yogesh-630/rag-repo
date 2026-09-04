const env = require('../config/env');
const {
  generateOpenAIAnswer,
  generateGeminiAnswer,
  generateDeterministicAnswer,
} = require('../services/aiService');

const SYSTEM_PROMPT = `You are CollegeRAG_AI, the official, highly authoritative AI College Information Assistant for the institution.
Your mission is to provide accurate, concise, helpful, and strictly grounded answers to student, faculty, and visitor questions based ONLY on the provided college documents.

Rules:
1. ONLY answer using facts explicitly mentioned in the PROVIDED CONTEXT CHUNKS.
2. DO NOT hallucinate, infer, or speculate beyond the provided text.
3. If the context does not contain enough information to give a definite answer, state clearly that the official college documents do not specify this detail and direct the student to the relevant department office.
4. Always cite your sources inline when mentioning policies, deadlines, or fees, referencing the document name and page number (e.g. "[Admissions Handbook, Page 3]").
5. Keep answers polite, structured, and easy to read with bullet points when listing requirements or steps.`;

/**
 * Synthesize grounded answer from context chunks.
 * @param {string} query
 * @param {Array<Object>} retrievedChunks
 * @param {number} topScore
 * @param {Function} onToken
 * @returns {Promise<{response: string, citations: Array<Object>, provider: string, tokens: Object, isUnknown: boolean}>}
 */
const synthesizeGroundedAnswer = async (query, retrievedChunks, topScore, onToken) => {
  const threshold = env.SIMILARITY_THRESHOLD || 0.70;

  // Unknown question bypass if below threshold or empty chunks
  if (!retrievedChunks || retrievedChunks.length === 0 || topScore < threshold) {
    const unknownMessage = `I could not find sufficiently confident information in the official college documents to answer your question regarding "${query}" (Relevance Confidence: ${(topScore * 100).toFixed(1)}%, required ≥ ${(threshold * 100).toFixed(0)}%).\n\nPlease check the uploaded documents in the Documents repository or contact the College Administrative Office for verified institutional assistance.`;

    if (onToken) {
      const parts = unknownMessage.split(' ');
      for (let i = 0; i < parts.length; i++) {
        const piece = (i === 0 ? '' : ' ') + parts[i];
        onToken(piece);
        await new Promise(r => setTimeout(r, 10));
      }
    }

    return {
      response: unknownMessage,
      citations: [],
      provider: 'threshold-guardrail',
      tokens: { promptTokens: 0, completionTokens: Math.round(unknownMessage.length / 4), totalTokens: Math.round(unknownMessage.length / 4) },
      isUnknown: true,
    };
  }

  // Format context chunks for LLM
  const contextText = retrievedChunks
    .map(
      (chunk, index) =>
        `--- CONTEXT CHUNK ${index + 1} [Document: "${chunk.fileName}", Page: ${chunk.pageNumber}, Category: ${chunk.category}, Relevance: ${(chunk.score * 100).toFixed(1)}%] ---\n${chunk.content}`
    )
    .join('\n\n');

  const userPrompt = `STUDENT QUESTION:\n${query}\n\nOFFICIAL INSTITUTIONAL CONTEXT:\n${contextText}\n\nPlease synthesize a clear, grounded response with inline document citations.`;

  // Citations list
  const citations = retrievedChunks.map(c => ({
    docId: c.docId,
    fileName: c.fileName,
    pageNumber: c.pageNumber,
    category: c.category,
    department: c.department,
    score: c.score,
    snippet: c.content.slice(0, 180) + '...',
  }));

  // Route to available AI Provider
  if (env.OPENAI_API_KEY) {
    try {
      const res = await generateOpenAIAnswer(userPrompt, SYSTEM_PROMPT, onToken);
      return { response: res.text, citations, provider: res.provider, tokens: res.tokens, isUnknown: false };
    } catch (err) {
      console.warn(`[Synthesizer] OpenAI failed: ${err.message}. Trying Gemini or fallback.`);
    }
  }

  if (env.GEMINI_API_KEY) {
    try {
      const res = await generateGeminiAnswer(userPrompt, SYSTEM_PROMPT, onToken);
      return { response: res.text, citations, provider: res.provider, tokens: res.tokens, isUnknown: false };
    } catch (err) {
      console.warn(`[Synthesizer] Gemini failed: ${err.message}. Trying fallback.`);
    }
  }

  // Resilient deterministic answer
  const res = await generateDeterministicAnswer(userPrompt, SYSTEM_PROMPT, retrievedChunks, onToken);
  return { response: res.text, citations, provider: res.provider, tokens: res.tokens, isUnknown: false };
};

module.exports = {
  synthesizeGroundedAnswer,
  SYSTEM_PROMPT,
};
