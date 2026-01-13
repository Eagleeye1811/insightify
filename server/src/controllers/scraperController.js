const { db } = require('../config/firebase');
const { resolveAppId, getAppDetails, getReviews, normalizeData } = require('../services/playStoreService');
const { analyzeReviews } = require('../services/aiService');

// ... existing helpers ...

exports.startAI = async (req, res) => {
    try {
        const { appId } = req.body;
        const userId = req.user.uid;

        if (!appId) return res.status(400).json({ error: 'App ID is required' });

        // Check if data exists
        const userAppRef = db.collection('users').doc(userId).collection('apps').doc(appId);
        const reviewsRef = userAppRef.collection('data').doc('reviews');
        const metaRef = userAppRef.collection('data').doc('metadata');

        const reviewsSnap = await reviewsRef.get();
        if (!reviewsSnap.exists) {
            return res.status(404).json({ error: 'No reviews found. Please scrape app first.' });
        }

        // Return immediately
        res.json({ status: 'processing', message: 'AI Analysis started' });

        // Background Processing
        (async () => {
            try {
                console.log(`🧠 Starting AI Analysis for ${appId}...`);
                const reviews = reviewsSnap.data().list || [];
                const metaSnap = await metaRef.get();
                const metadata = metaSnap.exists ? metaSnap.data() : { title: appId, genre: 'Unknown' };

                const analysis = await analyzeReviews(reviews, metadata);

                // Save to Firestore
                const analysisRef = userAppRef.collection('data').doc('analysis');
                await analysisRef.set({
                    ...analysis,
                    lastAnalyzed: new Date(),
                    version: '1.0'
                });

                console.log(`🧠 AI Analysis saved for ${appId}`);

                // Emit WebSocket Event
                const io = req.app.get('io');
                if (io) {
                    io.to(appId).emit('analysis_complete', analysis);
                    console.log(`📡 Emitted analysis_complete to room ${appId}`);
                }

            } catch (err) {
                console.error(`❌ AI Analysis failed for ${appId}:`, err);
                const io = req.app.get('io');
                if (io) {
                    io.to(appId).emit('analysis_error', { error: err.message });
                }
            }
        })();

    } catch (error) {
        console.error('Trigger AI error:', error);
        return res.status(500).json({ error: error.message });
    }
};

exports.analyzeApp = async (req, res) => {
    // ... existing analyzeApp implementation ...
    try {
        const { term } = req.body;
        const userId = req.user.uid; // From auth middleware

        if (!term) return res.status(400).json({ error: 'Search term is required' });

        console.log(`[User: ${userId}] Analyzing: ${term}`);

        // 1. Resolve App ID
        const appId = await resolveAppId(term);


        // 2. Check Cache (user-specific)
        try {
            const userAppRef = db.collection('users').doc(userId).collection('apps').doc(appId);
            const appDoc = await userAppRef.get();

            if (appDoc.exists) {
                const data = appDoc.data();
                if (data.cacheInfo && isCacheValid(data.cacheInfo.lastUpdated)) {
                    console.log(`Cache hit for ${appId} (user: ${userId})`);
                    return res.json({
                        status: 'completed',
                        appId,
                        message: 'Data retrieved from cache'
                    });
                }
            }
        } catch (cacheError) {
            console.log(`Cache check failed for ${appId}, will scrape fresh data`);
        }

        // 3. Queue Job if not cached or expired
        console.log(`Queueing scrape for ${appId} (user: ${userId})`);

        addJob(async () => {
            try {
                console.log(`📦 Background job started for ${appId} (user: ${userId})`);
                await performScrape(appId, userId);
                console.log(`📦 Background job completed for ${appId}`);

                // Optional: Auto-trigger AI here if desired?
                // For now, let's keep it separate or client-triggered
            } catch (err) {
                console.error(`📦 Background job FAILED for ${appId}:`, err.message);
                console.error(`   Stack:`, err.stack);
            }
        });

        return res.json({
            status: 'processing',
            appId,
            message: 'Analysis started'
        });

    } catch (error) {
        console.error('Analyze error:', error);
        return res.status(500).json({ error: error.message });
    }
};

exports.getAppResults = async (req, res) => {
    try {
        const { appId } = req.params;

        // Try to get metadata (handle NOT_FOUND for pending scrapes)
        const userId = req.user.uid; // From auth middleware
        let metaSnap, reviewsSnap, analysisSnap;

        try {
            const dataRef = db.collection('users').doc(userId).collection('apps').doc(appId).collection('data');

            // Parallel fetch
            const [meta, reviews, analysis] = await Promise.all([
                dataRef.doc('metadata').get(),
                dataRef.doc('reviews').get(),
                dataRef.doc('analysis').get()
            ]);

            metaSnap = meta;
            reviewsSnap = reviews;
            analysisSnap = analysis;

        } catch (firestoreError) {
            // If Firestore throws NOT_FOUND, data isn't ready yet
            return res.status(404).json({ error: 'Data not found or still processing' });
        }

        if (!metaSnap || !metaSnap.exists) {
            return res.status(404).json({ error: 'Data not found or still processing' });
        }

        const metadata = metaSnap.data();
        const reviewsData = reviewsSnap?.exists ? reviewsSnap.data() : { list: [] };
        const analysisData = analysisSnap?.exists ? analysisSnap.data() : null;

        res.json({
            appId,
            metadata,
            reviews: reviewsData.list || [],
            analysis: analysisData // Return analysis if exists
        });

    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Internal function to perform the scrape and save to DB
async function performScrape(appId, userId) {
    // ... existing performScrape ...
    console.log(`Starting scrape for ${appId}...`);

    try {
        // Fetch
        console.log(`  → Fetching app details...`);
        const details = await getAppDetails(appId);
        console.log(`  ✓ App details fetched: ${details.title}`);

        console.log(`  → Fetching reviews...`);
        const reviewsList = await getReviews(appId);
        console.log(`  ✓ Reviews fetched: ${reviewsList.length} reviews`);

        // Normalize
        console.log(`  → Normalizing data...`);
        const { metadata, reviews } = normalizeData(details, reviewsList);
        console.log(`  ✓ Data normalized: ${reviews.length} unique reviews`);

        // Batch write to Firestore
        console.log(`  → Saving to Firestore...`);
        const batch = db.batch();
        const appRef = db.collection('users').doc(userId).collection('apps').doc(appId);
        const dataRef = appRef.collection('data');
        const configRef = appRef.collection('config');

        batch.set(dataRef.doc('metadata'), metadata);
        batch.set(dataRef.doc('reviews'), { list: reviews });
        batch.set(configRef.doc('cacheInfo'), {
            lastUpdated: new Date(),
            version: '1.0'
        });

        await batch.commit();
        console.log(`✅ Scrape completed and saved for ${appId}`);

    } catch (error) {
        console.error(`❌ Scrape failed for ${appId}:`, error.message);
        console.error(`   Stack:`, error.stack);
        throw error;
    }
}
