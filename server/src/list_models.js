const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // There isn't a direct "listModels" on genAI instance in some SDK versions, 
        // but usually it's exposed via the API.
        // Actually, the SDK might not expose listModels directly on the main class easily in all versions.
        // Let's try to use the model to plain generation to see if we can get a hit, 
        // OR just try 'gemini-1.0-pro' which is often the fallback.

        // NOTE: The node SDK usually doesn't have a helper for listModels in the high-level entry.
        // We might need to use the REST API via fetch if the SDK doesn't support it clearly.
        // But let's try a standard known model 'gemini-pro' (which failed) and 'gemini-1.5-flash' (failed).

        // Let's try `gemini-pro-vision` or `gemini-1.0-pro-latest` just in case.

        // BETTER APPROACH: Use fetch to call the API directly to list models.
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
