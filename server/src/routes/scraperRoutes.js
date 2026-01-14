const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { analysisRateLimiter, scrapingRateLimiter } = require('../middleware/rateLimitMiddleware');

// Protected routes - require authentication + rate limiting
router.post('/search-apps', authenticateUser, scraperController.searchApps);
router.post('/analyze', authenticateUser, scrapingRateLimiter, scraperController.analyzeApp);
router.get('/results/:appId', authenticateUser, scraperController.getAppResults);
router.post('/analyze-ai', authenticateUser, analysisRateLimiter, scraperController.startAI);

module.exports = router;
