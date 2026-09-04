const ragService = require('../services/ragService');
const Conversation = require('../models/Conversation');
const { isInMemory, getMemoryStore } = require('../config/db');

const queryAssistant = async (req, res, next) => {
  try {
    const { query, conversationId, category, department, threshold } = req.body;
    const userId = req.user ? (req.user.id || req.user._id) : null;

    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Query prompt cannot be empty.' });
    }

    const result = await ragService.executeRAGQuery({
      userId,
      query,
      conversationId,
      category,
      department,
      threshold: threshold ? parseFloat(threshold) : undefined,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const userConvs = Array.from(memoryStore.conversations.values())
        .filter(c => c.userId.toString() === userId.toString())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return res.status(200).json({
        success: true,
        conversations: userConvs,
      });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt messages');

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const conv = memoryStore.conversations.get(id);
      if (!conv || conv.userId.toString() !== userId.toString()) {
        return res.status(404).json({ success: false, message: 'Conversation thread not found.' });
      }
      return res.status(200).json({ success: true, conversation: conv });
    }

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found.' });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { executionId, messageId, conversationId, feedback, comment } = req.body;
    await ragService.submitFeedback({ executionId, messageId, conversationId, feedback, comment });

    res.status(200).json({
      success: true,
      message: 'Feedback recorded. Thank you for helping improve answer accuracy!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  queryAssistant,
  getConversations,
  getConversationById,
  submitFeedback,
};
