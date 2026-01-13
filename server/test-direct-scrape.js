const gplay = require('google-play-scraper').default || require('google-play-scraper');

async function testDirectScraping() {
    console.log('🧪 Testing Direct Scraping...\n');

    const appId = 'com.whatsapp';

    try {
        console.log('1️⃣ Testing App Details...');
        const details = await gplay.app({ appId });
        console.log('   ✅ App Details Success');
        console.log(`   App: ${details.title}`);
        console.log(`   Rating: ${details.score}`);
        console.log(`   Developer: ${details.developer}\n`);

        console.log('2️⃣ Testing Reviews...');
        const reviewsResult = await gplay.reviews({
            appId,
            sort: gplay.sort.NEWEST,
            num: 10, // Start with just 10 for testing
            lang: 'en',
            country: 'us'
        });
        console.log(`   ✅ Reviews Success`);
        console.log(`   Reviews fetched: ${reviewsResult.data?.length || 0}\n`);

        if (reviewsResult.data && reviewsResult.data.length > 0) {
            console.log('   Sample Review:');
            const sample = reviewsResult.data[0];
            console.log(`   User: ${sample.userName}`);
            console.log(`   Rating: ${sample.score}/5`);
            console.log(`   Text: ${sample.text.substring(0, 100)}...\n`);
        }

        console.log('✅ All scraping tests passed!');

    } catch (error) {
        console.error('❌ Scraping failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDirectScraping();
