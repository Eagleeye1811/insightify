const NodeCache = require('node-cache');

/**
 * Response Cache for AI Responses
 * Reduces API calls by caching frequent queries
 */

// Create cache with 1 hour TTL (time to live)
const responseCache = new NodeCache({
    stdTTL: 3600, // 1 hour in seconds
    checkperiod: 600, // Check for expired keys every 10 minutes
    maxKeys: 1000, // Store max 1000 responses
    useClones: false // Don't clone data (better performance)
});

/**
 * Generate cache key from message and userId
 */
function generateCacheKey(message, userId) {
    // Normalize message (lowercase, trim, remove extra spaces)
    const normalizedMessage = message
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
    
    return `${userId}:${normalizedMessage}`;
}

/**
 * Get cached response
 */
function getCachedResponse(message, userId) {
    const key = generateCacheKey(message, userId);
    const cached = responseCache.get(key);
    
    if (cached) {
        console.log(`💾 Cache HIT for: "${message.substring(0, 50)}..."`);
        return cached;
    }
    
    console.log(`❌ Cache MISS for: "${message.substring(0, 50)}..."`);
    return null;
}

/**
 * Store response in cache
 */
function cacheResponse(message, userId, response, metadata = {}) {
    const key = generateCacheKey(message, userId);
    
    const cacheData = {
        response,
        metadata,
        cachedAt: new Date().toISOString(),
        fromCache: true
    };
    
    const success = responseCache.set(key, cacheData);
    
    if (success) {
        console.log(`💾 Cached response for: "${message.substring(0, 50)}..."`);
    }
    
    return success;
}

/**
 * Clear cache for specific user or all
 */
function clearCache(userId = null) {
    if (userId) {
        // Clear specific user's cache
        const keys = responseCache.keys();
        const userKeys = keys.filter(key => key.startsWith(`${userId}:`));
        responseCache.del(userKeys);
        console.log(`🗑️ Cleared ${userKeys.length} cached responses for user: ${userId}`);
        return userKeys.length;
    } else {
        // Clear all cache
        const count = responseCache.keys().length;
        responseCache.flushAll();
        console.log(`🗑️ Cleared all ${count} cached responses`);
        return count;
    }
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    const stats = responseCache.getStats();
    const keys = responseCache.keys();
    
    return {
        keys: keys.length,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        ksize: stats.ksize,
        vsize: stats.vsize
    };
}

/**
 * Check if caching is beneficial for this query
 */
function shouldCache(message, intent, hasData) {
    // Don't cache if message is too short (likely not useful)
    if (message.length < 5) return false;
    
    // Don't cache if no data (fallback responses may change)
    if (!hasData) return false;
    
    // Don't cache real-time or time-sensitive queries
    const timePattern = /today|now|current|latest|recent|this (week|month|year)/i;
    if (timePattern.test(message)) return false;
    
    // Cache analysis, stats, and general queries
    const cacheableIntents = ['stats', 'reviewAnalysis', 'bugReport', 'featureRequest', 'sentiment'];
    if (cacheableIntents.includes(intent)) return true;
    
    // Default: cache if message is specific enough
    return message.split(' ').length >= 3;
}

module.exports = {
    getCachedResponse,
    cacheResponse,
    clearCache,
    getCacheStats,
    shouldCache,
    responseCache
};
