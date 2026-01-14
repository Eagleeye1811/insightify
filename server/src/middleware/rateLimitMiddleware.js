const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects API endpoints from excessive use and manages Gemini API quota
 */

// Chat endpoint rate limiter - Per user
const chatRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // 10 requests per minute per user
    message: {
        error: 'rate_limit',
        message: 'Too many chat requests. Please wait a minute before trying again.',
        retryAfter: 60
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    // Use user ID as key for per-user limiting, fallback to 'anonymous'
    keyGenerator: (req) => {
        return req.body.userId || 'anonymous';
    },
    handler: (req, res) => {
        console.log(`⚠️ Rate limit exceeded for user: ${req.body.userId || 'anonymous'}`);
        res.status(429).json({
            error: 'rate_limit',
            message: 'You\'re sending too many requests. Please wait a minute before trying again.',
            retryAfter: 60
        });
    },
    skip: (req) => {
        // Skip rate limiting for specific conditions if needed
        return false;
    }
});

// Analysis endpoint rate limiter - More restrictive (AI analysis is expensive)
const analysisRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minute window
    max: 3, // 3 analysis requests per 5 minutes
    message: {
        error: 'rate_limit',
        message: 'Analysis quota exceeded. Please wait 5 minutes before analyzing again.',
        retryAfter: 300
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.uid || 'anonymous';
    },
    handler: (req, res) => {
        console.log(`⚠️ Analysis rate limit exceeded for user: ${req.user?.uid || 'anonymous'}`);
        res.status(429).json({
            error: 'rate_limit',
            message: 'You\'ve used your analysis quota. Please wait 5 minutes before analyzing another app.',
            retryAfter: 300
        });
    }
});

// Global rate limiter - Protects entire API
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes per IP
    message: {
        error: 'rate_limit',
        message: 'Too many requests from this IP. Please try again later.',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Scraping rate limiter - Very restrictive (external API calls)
const scrapingRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 scraping requests per hour
    message: {
        error: 'rate_limit',
        message: 'Scraping quota exceeded. Please wait 1 hour before scraping again.',
        retryAfter: 3600
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.uid || 'anonymous';
    },
    handler: (req, res) => {
        console.log(`⚠️ Scraping rate limit exceeded for user: ${req.user?.uid || 'anonymous'}`);
        res.status(429).json({
            error: 'rate_limit',
            message: 'You\'ve exceeded your scraping quota. Please wait 1 hour before scraping another app.',
            retryAfter: 3600
        });
    }
});

module.exports = {
    chatRateLimiter,
    analysisRateLimiter,
    globalRateLimiter,
    scrapingRateLimiter
};
