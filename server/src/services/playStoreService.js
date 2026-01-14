const gplay = require('google-play-scraper').default || require('google-play-scraper');
const { queue } = require('./queueService');

/**
 * Search for apps in Play Store (for real-time search)
 */
async function searchApps(query, num = 10) {
    try {
        const results = await queue.add(() => gplay.search({ term: query, num }));
        return results.map(app => ({
            appId: app.appId,
            title: app.title,
            icon: app.icon,
            rating: app.scoreText || app.score?.toFixed(1) || 'N/A',
            installs: app.installs || app.maxInstalls || 'N/A',
            summary: app.summary || '',
        }));
    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
}

/**
 * Extract App ID from a string (URL or Name)
 * If URL, extracts 'id' param.
 * If Name, searches Play Store and returns first result.
 */
async function resolveAppId(term) {
    term = term.trim();

    // Check if it's a full URL
    if (term.includes('play.google.com')) {
        try {
            const url = new URL(term);
            const id = url.searchParams.get('id');
            if (id) return id;
        } catch (e) {
            // invalid url, fall through to search
        }
    }

    // Check if it looks like a package name (com.example.app)
    const packageRegex = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+[0-9a-z_]*$/i;
    if (packageRegex.test(term)) {
        return term;
    }

    // Otherwise search
    try {
        const results = await queue.add(() => gplay.search({ term, num: 1 }));
        if (results && results.length > 0) {
            return results[0].appId;
        }
    } catch (error) {
        console.error('Search failed:', error);
        throw new Error('Failed to find app');
    }

    throw new Error('App not found');
}

/**
 * Fetch App Details (Metadata)
 */
async function getAppDetails(appId) {
    try {
        // Don't use queue here - it's already called from within a queued job
        return await gplay.app({ appId });
    } catch (error) {
        console.error(`Failed to fetch details for ${appId}:`, error);
        throw error;
    }
}

/**
 * Fetch Reviews with Balanced Sentiment Distribution
 * Strategy: Cover ALL sentiments for comprehensive analysis
 * - 5 most recent reviews (ALWAYS included for "Recent Reviews" display)
 * - 115 newest reviews (current trends, mixed sentiment)
 * - 90 critical reviews (1-2★ bugs, crashes, complaints)
 * - 90 helpful reviews (detailed feedback, often mixed/constructive)
 * 
 * This ensures we capture:
 * ✓ What customers demand
 * ✓ Bugs and crashes
 * ✓ Feature requests
 * ✓ What's good AND what's not
 * ✓ Always have the 5 most recent reviews for display
 */
async function getReviews(appId) {
    try {
        console.log(`📊 Starting balanced review collection for ${appId}...`);
        const allReviews = [];
        const reviewIds = new Set(); // Avoid duplicates

        // 1. ALWAYS get the 5 most recent reviews first (for Recent Reviews display)
        console.log('  → Fetching 5 most recent reviews (priority for display)...');
        try {
            const topRecentResult = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: 5,
                lang: 'en',
                country: 'us'
            });

            if (topRecentResult && topRecentResult.data) {
                topRecentResult.data.forEach(review => {
                    if (!reviewIds.has(review.id)) {
                        reviewIds.add(review.id);
                        allReviews.push({ 
                            ...review, 
                            source: 'newest', 
                            sentiment_category: getSentimentCategory(review.score),
                            isTopRecent: true // Mark as top 5 most recent
                        });
                    }
                });
                console.log(`  ✓ Added ${topRecentResult.data.length} top recent reviews (for display)`);
            }
        } catch (err) {
            console.warn('  ⚠ Failed to fetch top recent reviews:', err.message);
        }

        // 2. Get 115 more NEWEST reviews (to reach ~120 total newest, mixed sentiment)
        console.log('  → Fetching 115 additional newest reviews (all ratings)...');
        try {
            const newestResult = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: 120,
                lang: 'en',
                country: 'us'
            });

            if (newestResult && newestResult.data) {
                let addedCount = 0;
                newestResult.data.forEach(review => {
                    if (!reviewIds.has(review.id)) {
                        reviewIds.add(review.id);
                        allReviews.push({ 
                            ...review, 
                            source: 'newest', 
                            sentiment_category: getSentimentCategory(review.score),
                            isTopRecent: false
                        });
                        addedCount++;
                    }
                });
                console.log(`  ✓ Added ${addedCount} additional newest reviews`);
            }
        } catch (err) {
            console.warn('  ⚠ Failed to fetch newest reviews:', err.message);
        }

        // 3. Get 90 CRITICAL reviews (1-2 star - bugs, crashes, complaints)
        console.log('  → Fetching 90 critical reviews (low ratings for bugs/issues)...');
        try {
            // Fetch with RATING sort, then filter for low ratings
            const criticalResult = await gplay.reviews({
                appId,
                sort: gplay.sort.RATING,
                num: 200, // Fetch more to find enough low-rated ones
                lang: 'en',
                country: 'us'
            });

            if (criticalResult && criticalResult.data) {
                // Filter for 1-2 star reviews (critical feedback)
                const criticalReviews = criticalResult.data
                    .filter(r => r.score <= 2)
                    .slice(0, 90);

                let addedCount = 0;
                criticalReviews.forEach(review => {
                    if (!reviewIds.has(review.id)) {
                        reviewIds.add(review.id);
                        allReviews.push({ 
                            ...review, 
                            source: 'critical', 
                            sentiment_category: 'negative',
                            isTopRecent: false
                        });
                        addedCount++;
                    }
                });
                console.log(`  ✓ Added ${addedCount} critical reviews (bugs/complaints)`);
            }
        } catch (err) {
            console.warn('  ⚠ Failed to fetch critical reviews:', err.message);
        }

        // 4. Get 90 MOST HELPFUL reviews (detailed feedback, often constructive/mixed)
        console.log('  → Fetching 90 most helpful reviews (detailed feedback)...');
        try {
            const helpfulResult = await gplay.reviews({
                appId,
                sort: gplay.sort.HELPFULNESS,
                num: 90,
                lang: 'en',
                country: 'us'
            });

            if (helpfulResult && helpfulResult.data) {
                let addedCount = 0;
                helpfulResult.data.forEach(review => {
                    if (!reviewIds.has(review.id)) {
                        reviewIds.add(review.id);
                        allReviews.push({ 
                            ...review, 
                            source: 'helpful', 
                            sentiment_category: getSentimentCategory(review.score),
                            isTopRecent: false
                        });
                        addedCount++;
                    }
                });
                console.log(`  ✓ Added ${addedCount} helpful reviews`);
            }
        } catch (err) {
            console.warn('  ⚠ Failed to fetch helpful reviews:', err.message);
        }

        console.log(`📊 Total unique reviews collected: ${allReviews.length}`);

        // Analyze distributions
        const now = new Date();
        const timeDistribution = {
            'last_month': 0,
            'last_3_months': 0,
            'last_6_months': 0,
            'older': 0
        };

        const sentimentDistribution = {
            'positive': 0,    // 4-5 stars
            'neutral': 0,     // 3 stars
            'negative': 0     // 1-2 stars
        };

        allReviews.forEach(review => {
            // Time distribution
            const reviewDate = new Date(review.date);
            const monthsDiff = (now - reviewDate) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsDiff <= 1) timeDistribution.last_month++;
            else if (monthsDiff <= 3) timeDistribution.last_3_months++;
            else if (monthsDiff <= 6) timeDistribution.last_6_months++;
            else timeDistribution.older++;

            // Sentiment distribution
            sentimentDistribution[review.sentiment_category]++;
        });

        console.log('  📅 Time distribution:', timeDistribution);
        console.log('  😊 Sentiment distribution:', sentimentDistribution);

        return allReviews;
    } catch (error) {
        console.error(`❌ Failed to fetch reviews for ${appId}:`, error);
        throw error;
    }
}

/**
 * Helper: Categorize review sentiment by rating
 */
function getSentimentCategory(score) {
    if (score >= 4) return 'positive';
    if (score === 3) return 'neutral';
    return 'negative';
}

/**
 * Normalize and Clean Data
 */
function normalizeData(details, reviews) {
    // Normalize Metadata
    const metadata = {
        appId: details.appId,
        title: details.title,
        icon: details.icon,
        summary: details.summary,
        description: details.description,
        score: details.score,
        scoreText: details.scoreText, // e.g. "4.5"
        ratings: details.ratings,
        reviews: details.reviews,
        histogram: details.histogram,
        price: details.price,
        free: details.free,
        currency: details.currency,
        developer: details.developer,
        url: details.url,
        version: details.version || "unknown",
        updated: details.updated,
        genre: details.genre,
        installs: details.installs
    };

    // Normalize Reviews with enhanced metadata
    const cleanReviews = reviews
        .filter(r => r.text && r.text.trim().length > 0) // Remove empty
        .map(r => {
            const reviewDate = new Date(r.date);
            const now = new Date();
            const daysAgo = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
            
            return {
                id: r.id,
                userName: r.userName,
                userImage: r.userImage,
                date: r.date,
                score: r.score,
                text: r.text.trim(),
                version: r.version || "unknown",
                thumbsUp: r.thumbsUp,
                source: r.source || 'newest', // newest, critical, or helpful
                sentiment_category: r.sentiment_category || (r.score >= 4 ? 'positive' : r.score === 3 ? 'neutral' : 'negative'),
                daysAgo: daysAgo,
                recency: daysAgo <= 30 ? 'recent' : daysAgo <= 90 ? 'moderate' : 'old',
                isTopRecent: r.isTopRecent || false // Flag for top 5 most recent reviews
            };
        });

    // Remove duplicates (by id)
    const uniqueReviews = Array.from(new Map(cleanReviews.map(item => [item.id, item])).values());

    // Log distribution stats
    const stats = {
        total: uniqueReviews.length,
        recency: {
            recent: uniqueReviews.filter(r => r.recency === 'recent').length,
            moderate: uniqueReviews.filter(r => r.recency === 'moderate').length,
            old: uniqueReviews.filter(r => r.recency === 'old').length
        },
        sentiment: {
            positive: uniqueReviews.filter(r => r.sentiment_category === 'positive').length,
            neutral: uniqueReviews.filter(r => r.sentiment_category === 'neutral').length,
            negative: uniqueReviews.filter(r => r.sentiment_category === 'negative').length
        },
        avgRating: (uniqueReviews.reduce((sum, r) => sum + r.score, 0) / uniqueReviews.length).toFixed(2),
        sources: {
            newest: uniqueReviews.filter(r => r.source === 'newest').length,
            critical: uniqueReviews.filter(r => r.source === 'critical').length,
            helpful: uniqueReviews.filter(r => r.source === 'helpful').length
        }
    };
    console.log('  📈 Final review stats:', stats);

    // Sort by date (newest first) for better dashboard display
    uniqueReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { metadata, reviews: uniqueReviews };
}

/**
 * HELPER: Artificially spread review dates if they are all too recent.
 * This is for DEMO purposes to ensure Dashboard charts look good 
 * even if we only scraped the last 2 hours of reviews for a popular app.
 */
function distributeDatesForDemo(reviews) {
    if (reviews.length < 50) return reviews; // Don't mess with small datasets

    // Check time span
    const dates = reviews.map(r => new Date(r.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daySpan = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // If data covers less than 30 days, spread it out over 6 months
    if (daySpan < 30) {
        console.log(`[DemoMode] Review span is only ${daySpan.toFixed(1)} days. Spreading dates for visualization compatibility.`);

        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Keep top 20 reviews real (Fresh)
        // Spread the rest
        return reviews.map((r, index) => {
            if (index < 20) return r; // Keep recent accurate

            // Deterministic random-ish scatter based on index
            // Distribute reviews evenly over the last 180 days
            // Add some jitter
            const randomDaysBack = Math.floor((index / reviews.length) * 180) + (Math.random() * 5);
            const newDate = new Date();
            newDate.setDate(now.getDate() - randomDaysBack);

            return {
                ...r,
                date: newDate.toISOString() // Rewrite date
            };
        });
    }

    return reviews;
}

module.exports = {
    searchApps,
    resolveAppId,
    getAppDetails,
    getReviews,
    normalizeData
};
