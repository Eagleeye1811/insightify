const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testScrapingOnly() {
    console.log('🧪 Testing Scraping → Firestore Flow\n');

    const testApp = 'whatsapp'; // Simple, popular app

    try {
        // Step 1: Trigger scraping
        console.log('1️⃣ Starting analysis...');
        const response = await axios.post(`${BASE_URL}/api/analyze`, { term: testApp });

        if (response.data.status === 'completed') {
            console.log('   ✅ Data already cached!');
            console.log(`   App ID: ${response.data.appId}\n`);
            return;
        }

        console.log(`   ✅ Scraping started for: ${response.data.appId}`);
        console.log(`   Status: ${response.data.status}\n`);

        // Step 2: Wait for completion
        console.log('2️⃣ Waiting for scraping to complete...');
        console.log('   (This takes 15-30 seconds with rate limiting)\n');

        const appId = response.data.appId;
        let attempts = 0;
        const maxAttempts = 15; // 15 attempts × 3 seconds = 45 seconds max

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

            try {
                const checkResponse = await axios.get(`${BASE_URL}/api/results/${appId}`);

                // Success! Data is available
                console.log(`   ✅ Scraping completed after ${attempts * 3} seconds!`);
                console.log(`\n3️⃣ Data Summary:`);
                console.log(`   App: ${checkResponse.data.metadata.title}`);
                console.log(`   Developer: ${checkResponse.data.metadata.developer}`);
                console.log(`   Rating: ${checkResponse.data.metadata.score}/5`);
                console.log(`   Total Ratings: ${checkResponse.data.metadata.ratings?.toLocaleString() || 'N/A'}`);
                console.log(`   Reviews Scraped: ${checkResponse.data.reviews.length}`);
                console.log(`   Version: ${checkResponse.data.metadata.version}`);
                console.log(`\n✅ Data successfully saved to Firestore!`);
                return;

            } catch (error) {
                if (error.response?.status === 404) {
                    process.stdout.write(`\r   ⏳ Still processing... (${attempts * 3}s elapsed)`);
                } else {
                    throw error;
                }
            }
        }

        console.log(`\n\n   ⚠️  Timeout: Scraping took longer than ${maxAttempts * 3} seconds`);
        console.log('   Check server logs for errors');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('   Response:', error.response.data);
        }
    }
}

console.log('═══════════════════════════════════════');
console.log('  Scraping → Firestore Verification');
console.log('═══════════════════════════════════════\n');

testScrapingOnly();
