const { db } = require('../config/firebase');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const requestQueue = require('../utils/requestQueue');

/**
 * RAG Service - Retrieval Augmented Generation with Request Queuing
 * Retrieves relevant data from Firestore and uses it as context for AI responses
 */

class RAGService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing in environment variables");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = null;
        this.requestQueue = requestQueue;
    }

    async getModel() {
        // Don't cache model to allow trying different models on each request
        // UPDATED: Using current Gemini model names (Jan 2026)
        const MODELS_TO_TRY = [
            "gemini-2.5-flash",          // Latest & fastest (Jan 2026)
            "gemini-flash-latest",       // Auto-updates to latest flash
            "gemini-2.0-flash",          // Stable 2.0 flash
            "gemini-2.5-pro",            // Most capable (Jan 2026)
            "gemini-pro-latest",         // Auto-updates to latest pro
        ];

        let lastError = null;
        for (const modelName of MODELS_TO_TRY) {
            try {
                const model = this.genAI.getGenerativeModel({ model: modelName });
                console.log(`✅ Attempting to use AI Model: ${modelName}`);
                return model;
            } catch (err) {
                console.warn(`⚠️ Model ${modelName} initialization failed: ${err.message}`);
                lastError = err;
            }
        }
        
        throw lastError || new Error("No AI model available");
    }

    /**
     * Retrieve user's apps from Firestore
     * Apps are stored in: /users/{userId}/apps/{appId}/data/metadata
     */
    async getUserApps(userId) {
        try {
            // Query the nested structure: users/{userId}/apps
            const appsRef = db.collection('users').doc(userId).collection('apps');
            const appDocs = await appsRef.listDocuments();
            
            console.log(`📱 Found ${appDocs.length} app document refs for user ${userId}`);

            const apps = [];

            // Fetch metadata for each app
            await Promise.all(appDocs.slice(0, 10).map(async (docRef) => {
                try {
                    const metaRef = docRef.collection('data').doc('metadata');
                    const metaSnap = await metaRef.get();

                    if (metaSnap.exists) {
                        const data = metaSnap.data();
                        apps.push({
                            id: docRef.id,
                            appId: docRef.id,
                            title: data.title || docRef.id,
                            genre: data.genre || 'Unknown',
                            score: data.score || 0,
                            reviews: data.reviews || 0,
                            icon: data.icon || '',
                            ...data
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to fetch metadata for ${docRef.id}:`, err.message);
                }
            }));

            console.log(`✅ Successfully loaded ${apps.length} apps with metadata`);
            return apps;
        } catch (error) {
            console.error('Error fetching user apps:', error);
            return [];
        }
    }

    /**
     * Retrieve reviews for a specific app
     * Reviews might be stored in: /users/{userId}/apps/{appId}/data/reviews
     * Or in a flat collection: /reviews where appId matches
     */
    async getAppReviews(appId, userId, limit = 50) {
        try {
            console.log(`🔍 Searching for reviews - appId: ${appId}, userId: ${userId}`);
            
            // Try nested structure first: users/{userId}/apps/{appId}/data/reviews
            if (userId && userId !== 'anonymous') {
                const reviewsPath = `users/${userId}/apps/${appId}/data/reviews`;
                console.log(`🔍 Checking path: ${reviewsPath}`);
                
                const reviewsRef = db.collection('users')
                    .doc(userId)
                    .collection('apps')
                    .doc(appId)
                    .collection('data');
                
                const reviewsDoc = await reviewsRef.doc('reviews').get();
                
                if (reviewsDoc.exists) {
                    const reviewsData = reviewsDoc.data();
                    console.log(`✅ Found reviews document, keys:`, Object.keys(reviewsData));
                    
                    // Check different possible field names for reviews array
                    const reviewsArray = reviewsData.list || reviewsData.reviews || reviewsData.data || [];
                    console.log(`📊 Found ${reviewsArray.length} reviews in nested structure (field: ${reviewsData.list ? 'list' : reviewsData.reviews ? 'reviews' : 'data'})`);
                    return reviewsArray.slice(0, limit);
                } else {
                    console.log(`❌ No reviews document at ${reviewsPath}`);
                }
                
                // Also check if reviews is a subcollection
                const reviewsSubcollection = await reviewsRef.doc(appId).collection('reviews').limit(limit).get();
                if (!reviewsSubcollection.empty) {
                    const reviews = [];
                    reviewsSubcollection.forEach(doc => {
                        reviews.push({ id: doc.id, ...doc.data() });
                    });
                    console.log(`📊 Found ${reviews.length} reviews in subcollection`);
                    return reviews;
                }
            }

            // Fallback: Try flat collection structure
            console.log(`🔍 Trying flat collection: reviews where appId == ${appId}`);
            const reviewsSnapshot = await db.collection('reviews')
                .where('appId', '==', appId)
                .limit(limit)
                .get();

            const reviews = [];
            reviewsSnapshot.forEach(doc => {
                reviews.push({ id: doc.id, ...doc.data() });
            });

            console.log(`📊 Found ${reviews.length} reviews in flat collection`);
            return reviews;
        } catch (error) {
            console.error('❌ Error fetching reviews:', error);
            return [];
        }
    }

    /**
     * Retrieve analysis results for an app
     * Analysis might be in: /users/{userId}/apps/{appId}/data/analysis
     * Or in flat collection: /analyses/{appId}
     */
    async getAppAnalysis(appId, userId) {
        try {
            // Try nested structure first
            if (userId && userId !== 'anonymous') {
                const analysisRef = db.collection('users')
                    .doc(userId)
                    .collection('apps')
                    .doc(appId)
                    .collection('data')
                    .doc('analysis');
                
                const analysisDoc = await analysisRef.get();
                
                if (analysisDoc.exists) {
                    console.log(`📈 Found analysis in nested structure for ${appId}`);
                    return { id: analysisDoc.id, ...analysisDoc.data() };
                }
            }

            // Fallback: Try flat collection
            const analysisDoc = await db.collection('analyses')
                .doc(appId)
                .get();

            if (analysisDoc.exists) {
                console.log(`📈 Found analysis in flat collection for ${appId}`);
                return { id: analysisDoc.id, ...analysisDoc.data() };
            }
            
            console.log(`⚠️ No analysis found for ${appId}`);
            return null;
        } catch (error) {
            console.error('Error fetching analysis:', error);
            return null;
        }
    }

    /**
     * Retrieve all reviews across all user's apps
     */
    async getAllUserReviews(userId, limit = 100) {
        try {
            // First get user's apps
            const apps = await this.getUserApps(userId);
            
            if (apps.length === 0) return [];

            const allReviews = [];

            // Get reviews for each app
            for (const app of apps) {
                const appReviews = await this.getAppReviews(app.id, userId, 50);
                allReviews.push(...appReviews);
                
                // Stop if we have enough
                if (allReviews.length >= limit) break;
            }

            // Sort by date and limit
            const sortedReviews = allReviews
                .sort((a, b) => {
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);
                    return dateB - dateA;
                })
                .slice(0, limit);

            console.log(`📊 Collected ${sortedReviews.length} reviews across ${apps.length} apps`);
            return sortedReviews;
        } catch (error) {
            console.error('Error fetching all reviews:', error);
            return [];
        }
    }

    /**
     * Detect user intent and extract relevant entities (app names, etc.)
     */
    analyzeIntent(message, userApps) {
        const lowerMessage = message.toLowerCase();
        
        // Check for specific app mentions
        let mentionedApp = null;
        for (const app of userApps) {
            const appName = app.title?.toLowerCase() || '';
            if (lowerMessage.includes(appName)) {
                mentionedApp = app;
                break;
            }
        }

        // Classify intent
        const intents = {
            reviewAnalysis: /review|feedback|comment|rating|user.*said/i.test(message),
            bugReport: /bug|issue|problem|error|crash|fix/i.test(message),
            featureRequest: /feature|request|want|need|suggest|improvement/i.test(message),
            sentiment: /sentiment|feeling|opinion|satisfaction|happy|sad/i.test(message),
            stats: /how many|count|number|statistic|total|average/i.test(message),
            comparison: /compare|versus|vs|better|worse/i.test(message),
            recommendation: /recommend|suggest|advice|should|what.*do/i.test(message),
            general: true // Default fallback
        };

        // Find the primary intent
        const primaryIntent = Object.keys(intents).find(key => 
            key !== 'general' && intents[key]
        ) || 'general';

        return {
            intent: primaryIntent,
            mentionedApp,
            needsAppContext: mentionedApp !== null || 
                           primaryIntent !== 'general' && userApps.length > 0
        };
    }

    /**
     * Build context from retrieved data
     */
    buildContext(userApps, reviews, analysis, mentionedApp) {
        let context = "# Available Data\n\n";

        // Apps context
        if (userApps.length > 0) {
            context += "## User's Apps:\n";
            userApps.forEach(app => {
                context += `- ${app.title} (${app.genre || 'Unknown genre'})\n`;
                context += `  - Package: ${app.appId}\n`;
                context += `  - Current Rating: ${app.score || 'N/A'}\n`;
                context += `  - Total Reviews: ${app.reviews || 0}\n`;
            });
            context += "\n";
        }

        // Specific app focus
        if (mentionedApp) {
            context += `## Focus App: ${mentionedApp.title}\n`;
            context += `Details: ${JSON.stringify(mentionedApp, null, 2)}\n\n`;
        }

        // Reviews context
        if (reviews.length > 0) {
            context += `## Recent Reviews (${reviews.length} total):\n`;
            // Group by rating
            const byRating = { 1: [], 2: [], 3: [], 4: [], 5: [] };
            reviews.forEach(review => {
                if (review.score && byRating[review.score]) {
                    byRating[review.score].push(review);
                }
            });

            Object.keys(byRating).forEach(rating => {
                const ratingReviews = byRating[rating];
                if (ratingReviews.length > 0) {
                    context += `\n### ${rating}-Star Reviews (${ratingReviews.length}):\n`;
                    ratingReviews.slice(0, 5).forEach(review => {
                        const date = review.date ? new Date(review.date).toLocaleDateString() : 'Unknown date';
                        context += `- [${date}] ${review.text?.substring(0, 200) || 'No text'}\n`;
                    });
                }
            });
            context += "\n";
        }

        // Analysis context
        if (analysis) {
            context += "## Analysis Results:\n";
            if (analysis.bugs?.length > 0) {
                context += `### Bugs Found (${analysis.bugs.length}):\n`;
                analysis.bugs.forEach(bug => {
                    context += `- ${bug.name}: ${bug.description} (Severity: ${bug.severity})\n`;
                });
            }
            if (analysis.features?.length > 0) {
                context += `\n### Feature Requests (${analysis.features.length}):\n`;
                analysis.features.forEach(feature => {
                    context += `- ${feature.name} (${feature.type})\n`;
                });
            }
            if (analysis.sentiment) {
                context += `\n### Sentiment: ${analysis.sentiment.summary}\n`;
                if (analysis.sentiment.keywords) {
                    context += `Keywords: ${analysis.sentiment.keywords.join(', ')}\n`;
                }
            }
            context += "\n";
        }

        return context;
    }

    /**
     * Generate AI response with context and comprehensive model fallback
     */
    async generateResponse(message, context, intent) {
        // Comprehensive list of models to try, ordered by reliability
        // UPDATED: Using current Gemini model names (Jan 2026)
        const MODELS_TO_TRY = [
            // Latest stable models (Jan 2026)
            { name: "gemini-2.5-flash", priority: 1 },        // Best for speed
            { name: "gemini-flash-latest", priority: 1 },     // Auto-updates
            { name: "gemini-2.0-flash", priority: 2 },        // Stable 2.0
            { name: "gemini-2.0-flash-001", priority: 2 },    // Stable version
            { name: "gemini-2.5-pro", priority: 3 },          // Best for quality
            { name: "gemini-pro-latest", priority: 3 },       // Auto-updates pro
            
            // Lightweight alternatives
            { name: "gemini-2.0-flash-lite", priority: 4 },   // Lightweight & fast
            
            // Experimental models (if available)
            { name: "gemini-exp-1206", priority: 5 },         // Experimental
        ];

        const systemPrompt = `You are Insightify AI Assistant, an expert in app analytics and user feedback analysis.

Your role:
- Help developers understand their app reviews and user feedback
- Provide actionable insights based on data
- Answer questions about bugs, features, sentiment, and statistics
- Be friendly, professional, and concise

Context available:
${context}

Rules:
1. If data is available, use it to provide specific, data-driven answers
2. If no data is available, provide general helpful advice and suggest the user add their app
3. Be concise but thorough
4. Use bullet points for lists
5. Provide actionable recommendations when appropriate
6. If asked about specific metrics, calculate them from the data
7. For sensitive topics, be empathetic and constructive

User Intent: ${intent}
`;

        const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}\n\nProvide a helpful, data-driven response:`;

        let lastError = null;
        let attemptCount = 0;

        // Sort models by priority
        const sortedModels = MODELS_TO_TRY.sort((a, b) => a.priority - b.priority);

        // Try each model with retry logic
        for (const modelConfig of sortedModels) {
            const modelName = modelConfig.name;
            attemptCount++;
            
            try {
                console.log(`🤖 [Attempt ${attemptCount}/${sortedModels.length}] Trying model: ${modelName}`);
                
                const model = this.genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                });
                
                // Set timeout for the request
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout')), 30000)
                );
                
                const generatePromise = model.generateContent(fullPrompt);
                
                const result = await Promise.race([generatePromise, timeoutPromise]);
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ Success with model: ${modelName} (attempt ${attemptCount})`);
                return text;

            } catch (error) {
                lastError = error;
                const errorMessage = error.message || error.toString();
                
                // If rate limit (429), try next model immediately
                if (error.status === 429) {
                    console.warn(`⚠️ Rate limit (429) for ${modelName}, trying next model...`);
                    continue;
                }
                
                // If quota exceeded, try next model
                if (errorMessage.includes('quota') || errorMessage.includes('rate')) {
                    console.warn(`⚠️ Quota exceeded for ${modelName}, trying next model...`);
                    continue;
                }
                
                // If timeout, try next model
                if (errorMessage.includes('timeout')) {
                    console.warn(`⏱️ Timeout for ${modelName}, trying next model...`);
                    continue;
                }
                
                // If model not found, try next model
                if (error.status === 404 || errorMessage.includes('not found')) {
                    console.warn(`❓ Model ${modelName} not found, trying next model...`);
                    continue;
                }
                
                // For other errors, log and try next model
                console.error(`❌ Error with ${modelName}:`, errorMessage);
                
                // If we have more models to try, continue
                if (attemptCount < sortedModels.length) {
                    console.log(`🔄 Continuing to next model...`);
                    continue;
                }
                
                // If last model, throw error
                throw error;
            }
        }

        // All models failed
        console.error(`❌ All ${sortedModels.length} AI models failed`);
        console.error(`Last error:`, lastError?.message || lastError);
        
        // Throw descriptive error
        if (lastError?.status === 429 || lastError?.message?.includes('quota')) {
            throw new Error('All AI models are rate-limited. Please try again in a few minutes or use a different API key.');
        }
        
        throw lastError || new Error('All AI models failed to generate content');
    }

    /**
     * Generate fallback response when no data is available
     */
    generateFallbackResponse(message, intent) {
        const fallbacks = {
            reviewAnalysis: "I'd love to help you analyze reviews! However, I don't see any app data in your account yet. To get started:\n\n1. Add your app from the Dashboard\n2. We'll automatically fetch and analyze reviews\n3. Then I can answer specific questions about your user feedback\n\nIn the meantime, I can discuss general best practices for review analysis. What would you like to know?",
            
            bugReport: "I can help you identify and prioritize bugs from user reviews. Once you've added your app, I'll automatically:\n\n• Detect recurring bug mentions\n• Categorize by severity\n• Track affected user count\n• Suggest prioritization\n\nWould you like to add your app now, or discuss general bug tracking strategies?",
            
            featureRequest: "Understanding feature requests from reviews is crucial for product development. When you add your app, I'll help you:\n\n• Identify most-requested features\n• Estimate impact and demand\n• Prioritize based on user needs\n• Track request trends over time\n\nWhat specific aspect of feature analysis interests you?",
            
            sentiment: "Sentiment analysis provides valuable insights into user satisfaction. Once your app data is available, I can:\n\n• Calculate overall sentiment trends\n• Identify sentiment shifts over time\n• Highlight common praise and complaints\n• Compare sentiment across versions\n\nShall we discuss sentiment analysis strategies?",
            
            stats: "I can provide detailed statistics once your app data is loaded. I'll track:\n\n• Rating distributions\n• Review volume trends\n• Response times\n• User engagement metrics\n\nAdd your app to get started with analytics!",
            
            recommendation: "I'm here to provide actionable recommendations! While I don't have your specific app data yet, I can discuss:\n\n• General app improvement strategies\n• Review management best practices\n• User engagement techniques\n• A/B testing approaches\n\nWhat area would you like recommendations on?",
            
            general: "Hello! I'm your Insightify AI Assistant. I can help you:\n\n• Analyze app reviews and user feedback\n• Identify bugs and feature requests\n• Track sentiment trends\n• Provide actionable insights\n• Answer questions about your app's performance\n\nTo get the most from our conversation, add your app from the Dashboard. What would you like to know?"
        };

        return fallbacks[intent] || fallbacks.general;
    }

    /**
     * Main chat function - orchestrates RAG pipeline
     */
    async chat(message, userId) {
        try {
            console.log(`💬 RAG Chat request from user: ${userId}`);
            
            // Step 1: Retrieve user's apps
            const userApps = await this.getUserApps(userId);
            console.log(`📱 Found ${userApps.length} apps for user`);

            // Step 2: Analyze intent
            const { intent, mentionedApp, needsAppContext } = this.analyzeIntent(message, userApps);
            console.log(`🎯 Detected intent: ${intent}, App mentioned: ${mentionedApp?.title || 'None'}`);

            // Step 3: If no apps, provide fallback WITHOUT calling AI
            if (userApps.length === 0) {
                console.log('⚠️ No apps found, using fallback response');
                return {
                    response: this.generateFallbackResponse(message, intent),
                    intent,
                    hasData: false
                };
            }

            // Step 4: Retrieve relevant data - ALWAYS get data if user has apps
            let reviews = [];
            let analysis = null;

            if (userApps.length > 0) {
                if (mentionedApp) {
                    // Focus on specific app
                    console.log(`🎯 Getting reviews for mentioned app: ${mentionedApp.title}`);
                    reviews = await this.getAppReviews(mentionedApp.id, userId, 50);
                    analysis = await this.getAppAnalysis(mentionedApp.id, userId);
                } else {
                    // Get data from all user's apps
                    console.log(`🎯 Getting reviews for all ${userApps.length} apps`);
                    if (userApps.length === 1) {
                        reviews = await this.getAppReviews(userApps[0].id, userId, 50);
                        analysis = await this.getAppAnalysis(userApps[0].id, userId);
                    } else {
                        reviews = await this.getAllUserReviews(userId, 50);
                    }
                }
            }

            console.log(`📊 Retrieved ${reviews.length} reviews`);

            // Step 5: If still no data but we have apps, provide app-aware response
            if (reviews.length === 0 && !analysis && userApps.length > 0) {
                console.log('⚠️ No review data found but apps exist, using app-aware fallback');
                
                let response = `I can see you have ${userApps.length} app(s) in your account:\n\n`;
                userApps.forEach(app => {
                    response += `📱 **${app.title}** (${app.appId})\n`;
                });
                
                response += `\nHowever, I don't see any review data for these apps yet. This could mean:\n`;
                response += `1. Reviews haven't been scraped yet\n`;
                response += `2. The scraping is still in progress\n`;
                response += `3. Reviews are stored in a different location\n\n`;
                
                response += `To get insights about your apps, please:\n`;
                response += `1. Go to the Dashboard\n`;
                response += `2. Click "Analyze" on your app\n`;
                response += `3. Wait for the scraping to complete\n\n`;
                
                response += `In the meantime, I can discuss general app analytics strategies. What would you like to know?`;
                
                return {
                    response,
                    intent,
                    hasData: false,
                    dataUsed: {
                        apps: userApps.length,
                        reviews: 0,
                        hasAnalysis: false
                    }
                };
            }
            
            // Step 5b: If no apps at all, use standard fallback
            if (reviews.length === 0 && !analysis) {
                console.log('⚠️ No review data found, using fallback response');
                return {
                    response: this.generateFallbackResponse(message, intent),
                    intent,
                    hasData: false,
                    dataUsed: {
                        apps: userApps.length,
                        reviews: 0,
                        hasAnalysis: false
                    }
                };
            }

            // Step 6: Build context
            const context = this.buildContext(userApps, reviews, analysis, mentionedApp);

            // Step 7: Generate AI response with comprehensive model fallback and request queuing
            let response;
            let usedFallback = false;
            
            try {
                console.log(`🎨 Attempting AI generation with model fallback and request queuing...`);
                
                // Wrap AI call in request queue to throttle API usage
                response = await this.requestQueue.enqueue(async () => {
                    return await this.generateResponse(message, context, intent);
                }, 'normal');
                
                console.log(`✅ AI response generated successfully`);
            } catch (aiError) {
                // If AI fails after trying all models, provide smart fallback
                console.error('❌ All AI models failed, using intelligent fallback:', aiError.message);
                usedFallback = true;
                
                // Create a data-aware fallback response
                if (reviews.length > 0 || analysis) {
                    console.log(`📊 Using data-aware fallback with ${reviews.length} reviews`);
                    response = this.generateDataAwareFallback(message, intent, userApps, reviews, analysis);
                } else {
                    console.log(`💬 Using standard fallback response`);
                    response = this.generateFallbackResponse(message, intent);
                }
            }

            return {
                response,
                intent,
                hasData: reviews.length > 0 || analysis !== null,
                usedFallback,
                dataUsed: {
                    apps: userApps.length,
                    reviews: reviews.length,
                    hasAnalysis: analysis !== null
                }
            };

        } catch (error) {
            console.error('RAG Service Error:', error);
            
            // Check if it's a rate limit error
            if (error.status === 429 || error.message?.includes('quota')) {
                return {
                    response: "I'm currently experiencing high demand and have reached my rate limit. Please try again in a minute. In the meantime, I can help with general advice about app analytics and review management. What would you like to discuss?",
                    intent: 'rate_limit',
                    hasData: false,
                    error: 'rate_limit'
                };
            }
            
            // Graceful error fallback
            return {
                response: "I apologize, but I encountered an issue processing your request. Let me help you with general information instead. What would you like to know about app analytics and review management?",
                intent: 'error',
                hasData: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a smart, question-aware fallback using available data without AI
     */
    generateDataAwareFallback(message, intent, userApps, reviews, analysis) {
        const lowerMessage = message.toLowerCase();
        let response = '';

        // Analyze what the user is asking about
        const askingAbout = {
            bugs: /bug|issue|problem|error|crash|broken|fix|wrong/i.test(message),
            improvements: /improve|better|enhance|grow|increase|optimization/i.test(message),
            features: /feature|request|want|need|add|missing/i.test(message),
            positives: /good|great|love|like|best|working|positive|success/i.test(message),
            negatives: /bad|hate|dislike|worst|terrible|problem|complaint/i.test(message),
            growth: /grow|expand|increase|future|potential|scale/i.test(message),
            stats: /how many|statistics|count|number|percentage/i.test(message)
        };

        // Calculate review statistics
        let stats = { total: 0, avgRating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
        if (reviews.length > 0) {
            stats.total = reviews.length;
            let totalScore = 0;
            reviews.forEach(review => {
                if (review.score) {
                    stats.distribution[review.score]++;
                    totalScore += review.score;
                }
            });
            stats.avgRating = (totalScore / reviews.length).toFixed(2);
        }

        // Generate contextual response based on question
        
        // BUGS & PROBLEMS
        if (askingAbout.bugs || askingAbout.negatives) {
            response += `🔍 **Bug & Issue Analysis** (based on ${reviews.length} reviews):\n\n`;
            
            const lowRatedReviews = reviews.filter(r => r.score <= 2);
            response += `📊 **Low-Rated Reviews:** ${lowRatedReviews.length} (${((lowRatedReviews.length/reviews.length)*100).toFixed(1)}%)\n\n`;
            
            if (analysis?.bugs && analysis.bugs.length > 0) {
                response += `🐛 **Identified Bugs:**\n`;
                analysis.bugs.slice(0, 5).forEach((bug, i) => {
                    response += `${i + 1}. **${bug.name}** (${bug.severity})\n`;
                    response += `   - ${bug.description}\n`;
                    if (bug.frequency) response += `   - Frequency: ${bug.frequency}%\n`;
                });
            } else {
                response += `🐛 **Common Issues from 1-2 Star Reviews:**\n`;
                lowRatedReviews.slice(0, 3).forEach((review, i) => {
                    response += `${i + 1}. "${review.text?.substring(0, 100)}..."\n`;
                });
            }
            
            response += `\n💡 **Priority:** Focus on ${analysis?.bugs?.[0]?.name || 'the most frequent issues'} first!\n`;
        }
        
        // IMPROVEMENTS & GROWTH
        else if (askingAbout.improvements || askingAbout.growth) {
            response += `📈 **Growth & Improvement Analysis**:\n\n`;
            
            response += `📊 **Current Performance:**\n`;
            userApps.forEach(app => {
                response += `• ${app.title}: ${app.score}★ (${app.reviews || 0} total reviews)\n`;
            });
            
            const highRated = stats.distribution[5] + stats.distribution[4];
            const lowRated = stats.distribution[1] + stats.distribution[2];
            const satisfaction = ((highRated / stats.total) * 100).toFixed(1);
            
            response += `\n✅ **User Satisfaction:** ${satisfaction}% (${highRated} positive out of ${stats.total})\n\n`;
            
            response += `🎯 **To Improve & Grow:**\n\n`;
            
            if (analysis?.features && analysis.features.length > 0) {
                response += `**1. Implement Top Feature Requests:**\n`;
                analysis.features.slice(0, 3).forEach(feature => {
                    response += `   • ${feature.name} (${feature.frequency}% want this)\n`;
                });
                response += '\n';
            }
            
            if (analysis?.bugs && analysis.bugs.length > 0) {
                response += `**2. Fix Critical Bugs:**\n`;
                analysis.bugs.filter(b => b.severity === 'High').slice(0, 2).forEach(bug => {
                    response += `   • ${bug.name}\n`;
                });
                response += '\n';
            }
            
            response += `**3. Reduce ${lowRated} Low Ratings:**\n`;
            response += `   • Address complaints in 1-2 star reviews\n`;
            response += `   • Improve user onboarding\n\n`;
            
            response += `💡 **Growth Potential:** ${satisfaction >= 70 ? 'High' : satisfaction >= 50 ? 'Moderate' : 'Focus on quality first'}\n`;
        }
        
        // FEATURES
        else if (askingAbout.features) {
            response += `✨ **Feature Request Analysis**:\n\n`;
            
            if (analysis?.features && analysis.features.length > 0) {
                response += `📊 **Top ${analysis.features.length} Feature Requests:**\n\n`;
                analysis.features.forEach((feature, i) => {
                    response += `${i + 1}. **${feature.name}**\n`;
                    response += `   - Type: ${feature.type}\n`;
                    response += `   - Demand: ${feature.frequency}% of users\n`;
                    response += `   - Impact: ${feature.impact}\n\n`;
                });
                
                response += `💡 **Recommendation:** Start with "${analysis.features[0].name}" (highest demand)\n`;
            } else {
                response += `No formal feature analysis available yet.\n\n`;
                response += `**Based on reviews, users are asking for:**\n`;
                const highRatedReviews = reviews.filter(r => r.score >= 4);
                highRatedReviews.slice(0, 3).forEach((review, i) => {
                    if (review.text?.includes('wish') || review.text?.includes('would be')) {
                        response += `• "${review.text.substring(0, 100)}..."\n`;
                    }
                });
            }
        }
        
        // POSITIVES & SUCCESS
        else if (askingAbout.positives) {
            response += `🌟 **What's Working Well:**\n\n`;
            
            const highRated = stats.distribution[5] + stats.distribution[4];
            response += `✅ **${highRated} positive reviews** (${((highRated/stats.total)*100).toFixed(1)}%)\n\n`;
            
            response += `💬 **Users Love:**\n`;
            const fiveStarReviews = reviews.filter(r => r.score === 5);
            fiveStarReviews.slice(0, 5).forEach((review, i) => {
                response += `${i + 1}. "${review.text?.substring(0, 120)}..."\n\n`;
            });
            
            if (analysis?.sentiment?.keywords) {
                response += `🏷️ **Positive Keywords:** ${analysis.sentiment.keywords.join(', ')}\n\n`;
            }
            
            response += `💡 **Leverage these strengths in marketing!**\n`;
        }
        
        // STATISTICS
        else if (askingAbout.stats) {
            response += `📊 **Detailed Statistics:**\n\n`;
            
            response += `**Apps:**\n`;
            userApps.forEach(app => {
                response += `• ${app.title}\n`;
                response += `  - Rating: ${app.score}★\n`;
                response += `  - Reviews: ${app.reviews || 0}\n`;
            });
            
            response += `\n**Rating Distribution** (from ${reviews.length} analyzed):\n`;
            Object.keys(stats.distribution).reverse().forEach(rating => {
                const count = stats.distribution[rating];
                const percentage = ((count / stats.total) * 100).toFixed(1);
                const bar = '█'.repeat(Math.round(percentage / 5));
                response += `${rating}★: ${count.toString().padEnd(3)} (${percentage}%) ${bar}\n`;
            });
            
            response += `\n**Average Rating:** ${stats.avgRating}★\n`;
            response += `**Total Reviews Analyzed:** ${reviews.length}\n`;
            
            if (analysis) {
                response += `\n**Analysis Results:**\n`;
                response += `• Bugs Found: ${analysis.bugs?.length || 0}\n`;
                response += `• Feature Requests: ${analysis.features?.length || 0}\n`;
                response += `• Uninstall Reasons: ${analysis.uninstallReasons?.length || 0}\n`;
            }
        }
        
        // GENERAL / DEFAULT
        else {
            response += `📱 **Your Apps Overview:**\n\n`;
            
            userApps.forEach(app => {
                response += `**${app.title}**\n`;
                response += `• Rating: ${app.score}★ (${app.reviews || 0} reviews)\n`;
                response += `• Analyzed: ${reviews.length} reviews\n\n`;
            });
            
            response += `⭐ **Rating Breakdown:**\n`;
            Object.keys(stats.distribution).reverse().forEach(rating => {
                const count = stats.distribution[rating];
                const percentage = ((count / stats.total) * 100).toFixed(1);
                response += `${rating}★: ${count} (${percentage}%)\n`;
            });
            
            if (analysis?.bugs?.length > 0) {
                response += `\n🐛 **Top Issues:** ${analysis.bugs.slice(0, 2).map(b => b.name).join(', ')}\n`;
            }
            
            if (analysis?.features?.length > 0) {
                response += `✨ **Top Requests:** ${analysis.features.slice(0, 2).map(f => f.name).join(', ')}\n`;
            }
            
            response += `\n💬 **Ask me specific questions like:**\n`;
            response += `• "What bugs need fixing?"\n`;
            response += `• "How can I improve my app?"\n`;
            response += `• "What features do users want?"\n`;
            response += `• "What are users saying that's positive?"\n`;
        }
        
        response += `\n---\n⏰ *AI analysis temporarily unavailable due to rate limits. Try again in a minute for deeper insights!*`;

        return response;
    }
}

module.exports = new RAGService();
