const { v4: uuidv4 } = require('uuid');
const QueryExecution = require('../models/QueryExecution');
const ExecutionLog = require('../models/ExecutionLog');
const Conversation = require('../models/Conversation');
const { isInMemory, getMemoryStore } = require('../config/db');
const { retrieveRelevantContext } = require('../pipeline/retriever');
const { synthesizeGroundedAnswer } = require('../pipeline/synthesizer');
const { emitExecutionStep, emitStreamToken } = require('../config/socket');

/**
 * Execute the full end-to-end RAG workflow for a user query.
 */
const executeRAGQuery = async ({ userId, query, conversationId, category, department, threshold }) => {
  const startTime = Date.now();
  let executionId = uuidv4();

  // Create initial QueryExecution
  let executionObj = {
    _id: executionId,
    id: executionId,
    userId: userId || null,
    conversationId: conversationId || null,
    query: query.trim(),
    response: '',
    retrievedChunks: [],
    topSimilarityScore: 0,
    status: 'PROCESSING',
    durationMs: 0,
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    feedback: 'none',
    provider: 'pending',
    createdAt: new Date(),
  };

  if (isInMemory()) {
    getMemoryStore().executions.set(executionId, executionObj);
  } else {
    try {
      const created = await QueryExecution.create({
        userId: userId || null,
        conversationId: conversationId || null,
        query: query.trim(),
        status: 'PROCESSING',
      });
      executionId = created._id.toString();
      executionObj.id = executionId;
      executionObj._id = executionId;
    } catch (err) {
      console.warn(`[RAGService] DB execution create fallback: ${err.message}`);
    }
  }

  // Helper to log step and emit socket event
  const logStep = async (step, level, message, metadata = {}) => {
    const logId = uuidv4();
    const logData = {
      executionId,
      step,
      level,
      message,
      metadata,
      timestamp: new Date(),
    };

    if (isInMemory()) {
      getMemoryStore().logs.set(logId, logData);
    } else {
      try {
        await ExecutionLog.create(logData);
      } catch (err) {
        console.warn(`[RAGService] Log error: ${err.message}`);
      }
    }

    emitExecutionStep(executionId, logData);
  };

  try {
    // 1. STEP: Ingestion / Query Normalization
    await logStep('ingestion', 'info', `Received inquiry: "${query.slice(0, 70)}${query.length > 70 ? '...' : ''}"`, {
      length: query.length,
      categoryFilter: category || 'All',
      departmentFilter: department || 'All',
    });

    // 2. STEP: Vector Embedding & Hybrid Retrieval
    await logStep('retrieval', 'info', 'Generating 1536-dim query embedding and executing hybrid vector similarity search...');
    
    const retrievalResult = await retrieveRelevantContext(query, {
      category,
      department,
      threshold,
    });

    const { chunks, topScore, isConfident } = retrievalResult;

    await logStep(
      'retrieval',
      chunks.length > 0 ? 'success' : 'warning',
      `Retrieved ${chunks.length} candidate context chunks. Top cosine similarity: ${(topScore * 100).toFixed(1)}%`,
      {
        candidateCount: chunks.length,
        topScore,
        chunks: chunks.map(c => ({ doc: c.fileName, page: c.pageNumber, score: c.score })),
      }
    );

    // 3. STEP: Re-Ranking & Score Thresholding
    await logStep(
      'rerank',
      isConfident ? 'success' : 'warning',
      isConfident
        ? `Re-ranking passed confidence threshold (Score ${(topScore * 100).toFixed(1)}% ≥ 70%). Proceeding to synthesis.`
        : `Top similarity score ${(topScore * 100).toFixed(1)}% is below 70% confidence threshold. Guardrail triggered.`,
      {
        topScore,
        isConfident,
        threshold: threshold || 0.70,
      }
    );

    // 4. STEP: Grounded Answer Synthesis
    await logStep('synthesis', 'info', 'Synthesizing strictly grounded response with inline document citations...');

    const synthesisResult = await synthesizeGroundedAnswer(
      query,
      chunks,
      topScore,
      (token) => emitStreamToken(executionId, token)
    );

    const { response, citations, provider, tokens, isUnknown } = synthesisResult;
    const durationMs = Date.now() - startTime;

    await logStep(
      'synthesis',
      isUnknown ? 'warning' : 'success',
      isUnknown
        ? 'Bypassed LLM generation due to low relevance. Returned missing context guidance.'
        : `Grounded synthesis complete via ${provider} (${tokens.totalTokens || 0} tokens in ${durationMs}ms).`,
      {
        provider,
        durationMs,
        tokenUsage: tokens,
        citationCount: citations.length,
      }
    );

    // Update execution status
    if (isInMemory()) {
      const exec = getMemoryStore().executions.get(executionId);
      if (exec) {
        exec.response = response;
        exec.retrievedChunks = chunks;
        exec.topSimilarityScore = topScore;
        exec.status = 'COMPLETED';
        exec.durationMs = durationMs;
        exec.tokenUsage = tokens;
        exec.provider = provider;
      }
    } else {
      await QueryExecution.findByIdAndUpdate(executionId, {
        response,
        retrievedChunks: chunks,
        topSimilarityScore: topScore,
        status: 'COMPLETED',
        durationMs,
        tokenUsage: tokens,
        provider,
      });
    }

    // Update or create Conversation
    let activeConversationId = conversationId;
    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: response,
      citations,
      score: topScore,
      executionId,
      feedback: 'none',
      timestamp: new Date(),
    };

    if (userId) {
      if (activeConversationId) {
        if (isInMemory()) {
          const conv = getMemoryStore().conversations.get(activeConversationId);
          if (conv) {
            conv.messages.push({
              id: uuidv4(),
              role: 'user',
              content: query,
              timestamp: new Date(),
            });
            conv.messages.push(assistantMessage);
            conv.updatedAt = new Date();
          }
        } else {
          await Conversation.findByIdAndUpdate(activeConversationId, {
            $push: {
              messages: [
                { id: uuidv4(), role: 'user', content: query, timestamp: new Date() },
                assistantMessage,
              ],
            },
            $set: { updatedAt: new Date() },
          });
        }
      } else {
        // Create new conversation
        const convTitle = query.slice(0, 40) + (query.length > 40 ? '...' : '');
        if (isInMemory()) {
          const convId = uuidv4();
          const convObj = {
            _id: convId,
            id: convId,
            userId,
            title: convTitle,
            messages: [
              { id: uuidv4(), role: 'user', content: query, timestamp: new Date() },
              assistantMessage,
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          getMemoryStore().conversations.set(convId, convObj);
          activeConversationId = convId;
        } else {
          const createdConv = await Conversation.create({
            userId,
            title: convTitle,
            messages: [
              { id: uuidv4(), role: 'user', content: query, timestamp: new Date() },
              assistantMessage,
            ],
          });
          activeConversationId = createdConv._id.toString();
        }
      }
    }

    return {
      executionId,
      conversationId: activeConversationId,
      response,
      citations,
      topSimilarityScore: topScore,
      durationMs,
      tokenUsage: tokens,
      provider,
      isConfident,
      retrievedChunks: chunks,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`[RAGService] Execution ${executionId} failed:`, error);

    await logStep('synthesis', 'error', `Execution encountered error: ${error.message}`, {
      error: error.message,
      stack: error.stack,
    });

    if (isInMemory()) {
      const exec = getMemoryStore().executions.get(executionId);
      if (exec) {
        exec.status = 'FAILED';
        exec.durationMs = durationMs;
      }
    } else {
      await QueryExecution.findByIdAndUpdate(executionId, {
        status: 'FAILED',
        durationMs,
      });
    }

    throw error;
  }
};

const submitFeedback = async ({ executionId, messageId, conversationId, feedback, comment }) => {
  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    if (executionId) {
      const exec = memoryStore.executions.get(executionId);
      if (exec) {
        exec.feedback = feedback;
        exec.feedbackComment = comment || '';
      }
    }
    if (conversationId && messageId) {
      const conv = memoryStore.conversations.get(conversationId);
      if (conv) {
        const msg = conv.messages.find(m => m.id === messageId || m.executionId === executionId);
        if (msg) msg.feedback = feedback;
      }
    }
    return { success: true };
  }

  if (executionId) {
    await QueryExecution.findByIdAndUpdate(executionId, {
      feedback,
      feedbackComment: comment || '',
    });
  }

  if (conversationId && messageId) {
    await Conversation.updateOne(
      { _id: conversationId, 'messages.id': messageId },
      { $set: { 'messages.$.feedback': feedback } }
    );
  }

  return { success: true };
};

module.exports = {
  executeRAGQuery,
  submitFeedback,
};
