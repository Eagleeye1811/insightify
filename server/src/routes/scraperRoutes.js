const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.post('/analyze', authenticateUser, scraperController.analyzeApp);
router.get('/results/:appId', authenticateUser, scraperController.getAppResults);
router.post('/analyze-ai', authenticateUser, scraperController.startAI);

module.exports = router;
