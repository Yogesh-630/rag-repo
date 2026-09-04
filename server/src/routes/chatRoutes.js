const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/authMiddleware');
const { chatLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

// Public / Semi-public query endpoint (with optional user context)
router.post('/query', chatLimiter, (req, res, next) => {
  // Optional auth
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
}, chatController.queryAssistant);

// User conversation history
router.get('/conversations', authenticate, chatController.getConversations);
router.get('/conversations/:id', authenticate, chatController.getConversationById);

// Submit feedback
router.post('/feedback', chatController.submitFeedback);

module.exports = router;
