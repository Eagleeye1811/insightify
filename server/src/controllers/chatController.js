const ragService = require('../services/ragService');
const { db } = require('../config/firebase');
const { getCachedResponse, cacheResponse, shouldCache } = require('../utils/responseCache');

/**
 * Chat Controller - Handles chatbot interactions with caching
 */

/**
 * Main chat endpoint - processes user messages with RAG and caching
 */
exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required and must be a non-empty string' 
            });
        }

        // Get user ID from auth middleware or use 'anonymous'
        const userId = req.user?.uid || req.body.userId || 'anonymous';

        console.log(`💬 Chat request from user ${userId}: "${message.substring(0, 50)}..."`);

        // Check cache first
        const cached = getCachedResponse(message, userId);
        if (cached) {
            console.log(`✅ Returning cached response (saved API call!)`);
            return res.json({
                ...cached,
                fromCache: true
            });
        }

        // Process through RAG service
        const result = await ragService.chat(message, userId);

        // Cache the response if appropriate
        if (shouldCache(message, result.intent, result.hasData)) {
            cacheResponse(message, userId, result.response, {
                intent: result.intent,
                hasData: result.hasData,
                dataUsed: result.dataUsed
            });
        }

        // Log the interaction (optional)
        try {
            await db.collection('chat_logs').add({
                userId,
                message,
                response: result.response,
                intent: result.intent,
                hasData: result.hasData,
                usedFallback: result.usedFallback,
                timestamp: new Date().toISOString(),
                dataUsed: result.dataUsed || null,
                fromCache: false
            });
        } catch (logError) {
            console.error('Failed to log chat interaction:', logError);
            // Don't fail the request if logging fails
        }

        res.json({
            response: result.response,
            intent: result.intent,
            hasData: result.hasData,
            usedFallback: result.usedFallback,
            dataUsed: result.dataUsed,
            fromCache: false
        });

    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat message',
            message: error.message 
        });
    }
};

/**
 * Get chat history for a user
 */
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId || 'anonymous';
        const limit = parseInt(req.query.limit) || 50;

        const chatLogsSnapshot = await db.collection('chat_logs')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const history = [];
        chatLogsSnapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            history,
            count: history.length
        });

    } catch (error) {
        console.error('Get Chat History Error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve chat history',
            message: error.message 
        });
    }
};

/**
 * Clear chat history for a user
 */
exports.clearChatHistory = async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId || 'anonymous';

        const chatLogsSnapshot = await db.collection('chat_logs')
            .where('userId', '==', userId)
            .get();

        const batch = db.batch();
        chatLogsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({
            success: true,
            message: `Cleared ${chatLogsSnapshot.size} chat messages`
        });

    } catch (error) {
        console.error('Clear Chat History Error:', error);
        res.status(500).json({ 
            error: 'Failed to clear chat history',
            message: error.message 
        });
    }
};

/**
 * Get chat statistics
 */
exports.getChatStats = async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId || 'anonymous';

        const chatLogsSnapshot = await db.collection('chat_logs')
            .where('userId', '==', userId)
            .get();

        const stats = {
            totalMessages: 0,
            byIntent: {},
            withData: 0,
            withoutData: 0
        };

        chatLogsSnapshot.forEach(doc => {
            const data = doc.data();
            stats.totalMessages++;

            if (data.intent) {
                stats.byIntent[data.intent] = (stats.byIntent[data.intent] || 0) + 1;
            }

            if (data.hasData) {
                stats.withData++;
            } else {
                stats.withoutData++;
            }
        });

        res.json(stats);

    } catch (error) {
        console.error('Get Chat Stats Error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve chat statistics',
            message: error.message 
        });
    }
};
