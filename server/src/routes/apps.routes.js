const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, appController.listApps);

module.exports = router;
