const { GoogleGenerativeAI } = require("@google/generative-ai");
const requestQueue = require('../utils/requestQueue');

/**
 * Analyzes app reviews using Google Gemini to extract insights.
 * @param {Array} reviews - List of review objects { score, text, date, ... }
 * @param {Object} metadata - App metadata object { title, genre, ... }
 * @returns {Promise<Object>} Structured analysis result
 */
exports.analyzeReviews = async (reviews, metadata) => {
  try {
    console.log("DEBUG: Checking GEMINI_API_KEY...", process.env.GEMINI_API_KEY ? "Found" : "Missing");

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    // Initialize Gemini lazily
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List of models to try in order of preference
    // UPDATED: Using current Gemini model names (Jan 2026)
    const MODELS_TO_TRY = [
      "gemini-2.5-flash",        // Latest & fastest (Jan 2026)
      "gemini-flash-latest",     // Auto-updates to latest flash
      "gemini-2.0-flash",        // Stable 2.0 flash
      "gemini-2.5-pro",          // Most capable (Jan 2026)
      "gemini-pro-latest"        // Auto-updates to latest pro
    ];

    // Filter valid reviews first
    const validReviews = reviews
      .filter(r => r.text && r.text.length > 10)
      .map(r => ({ ...r, dateObj: new Date(r.date) }))
      .sort((a, b) => b.dateObj - a.dateObj); // Sort newest first

    // 1. Take 7 most recent reviews
    const recentReviews = validReviews.slice(0, 7);
    const existingIds = new Set(recentReviews.map(r => r.id || r.text)); // Track used reviews

    // 2. Scatter remaining: Group by Month -> Pick top 3 from each month
    const historicalPicks = [];
    const monthMap = {};

    // Start from index 7 (skip the recent ones we already picked)
    validReviews.slice(7).forEach(r => {
      if (historicalPicks.length + recentReviews.length >= 50) return; // Hard stop at 50 total

      const key = r.dateObj.toISOString().slice(0, 7); // YYYY-MM
      if (!monthMap[key]) monthMap[key] = 0;

      if (monthMap[key] < 3) { // Take max 3 per month
        monthMap[key]++;
        historicalPicks.push(r);
      }
    });

    // 3. Combine and Format
    const finalSelection = [...recentReviews, ...historicalPicks];

    const significantReviews = finalSelection
      .map(r => `[${r.dateObj.toISOString().split('T')[0]} - ${r.score} stars] ${r.text.substring(0, 300)}`)
      .join("\n");

    const prompt = `
You are an expert App Store Analyst. Analyze the following user reviews for the app "${metadata.title}" (Category: ${metadata.genre}).

Reviews:
${significantReviews}

Task:
Extract insights and return STRICT JSON with this exact structure:
{
  "bugs": [
    { "name": "Short title", "description": "Details", "severity": "High|Medium|Low", "frequency": 0-100 (estimated %), "affectedUsers": estimated_count }
  ],
  "features": [
    { "name": "Feature Request", "type": "UX|Functionality|Performance", "frequency": 0-100 (estimated %), "impact": "High|Medium|Low" }
  ],
  "uninstallReasons": [
    { "reason": "Reason", "count": estimated_count, "percentage": 0-100 }
  ],
  "sentiment": {
    "summary": "1-2 sentence executive summary of user sentiment",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "recommendations": [
    { "title": "Actionable Title", "description": "What to do", "impact": "High|Medium|Low", "action": "Specific step" }
  ]
}

Focus on:
1. Recurring technical issues (bugs).
2. Missing features users are asking for.
3. Why users are leaving (uninstall reasons).
4. Strategic recommendations for the developer.

Return ONLY the valid JSON object. Do not wrap in markdown code blocks.
`;

    let lastError = null;

    // Try each model until one works - with request queuing for rate limiting
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🤖 Trying AI Model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Use request queue to throttle API calls (high priority for analysis)
        const text = await requestQueue.enqueue(async () => {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        }, 'high'); // High priority for app analysis

        // Clean up markdown if present (Gemini sometimes adds ```json ... ```)
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
          const parsed = JSON.parse(cleanJson);
          console.log(`✅ Success with model: ${modelName}`);
          return parsed;
        } catch (e) {
          console.error(`⚠️ Failed to parse JSON from ${modelName}:`, text);
          // If JSON parsing fails, we might want to try another model or just throw
          // Usually it's model behavior, so let's try next model if available
          throw new Error("Invalid JSON response");
        }

      } catch (err) {
        console.warn(`⚠️ Model ${modelName} failed: ${err.message}`);
        lastError = err;
        // Continue to next model
      }
    }

    // If loop finishes without success
    throw lastError || new Error("All AI models failed to generate content.");

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
