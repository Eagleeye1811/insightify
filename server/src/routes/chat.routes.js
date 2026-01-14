const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { chatRateLimiter } = require('../middleware/rateLimitMiddleware');

/**
 * Chat Routes - RAG-based chatbot endpoints with rate limiting
 */

// Main chat endpoint - Rate limited to 10 requests/minute per user
router.post('/', chatRateLimiter, chatController.chat);

// Chat history management - No rate limit (readonly)
router.get('/history', chatController.getChatHistory);
router.delete('/history', chatController.clearChatHistory);

// Chat statistics - No rate limit (readonly)
router.get('/stats', chatController.getChatStats);

module.exports = router;
