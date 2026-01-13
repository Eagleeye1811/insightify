const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const TEST_APP = 'whatsapp'; // Simple app name to test

console.log('🧪 Starting Comprehensive Scraper Tests...\n');

// Helper to make requests with error handling
async function testEndpoint(name, method, url, data = null) {
    console.log(`\n📍 Testing: ${name}`);
    console.log(`   ${method} ${url}`);
    try {
        const config = { method, url: `${BASE_URL}${url}` };
        if (data) config.data = data;

        const response = await axios(config);
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📦 Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`   ❌ Error: ${error.response?.status || 'Network Error'}`);
        console.log(`   📦 Error:`, error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
}

async function runTests() {
    let testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Server Health Check
    console.log('\n═══════════════════════════════════════');
    console.log('TEST 1: Server Health Check');
    console.log('═══════════════════════════════════════');
    const healthCheck = await testEndpoint('Health Check', 'GET', '/');
    testResults.tests.push({ name: 'Health Check', ...healthCheck });
    healthCheck.success ? testResults.passed++ : testResults.failed++;

    // Test 2: Start Analysis
    console.log('\n═══════════════════════════════════════');
    console.log('TEST 2: Start App Analysis');
    console.log('═══════════════════════════════════════');
    const analyzeResult = await testEndpoint(
        'Analyze App',
        'POST',
        '/api/analyze',
        { term: TEST_APP }
    );
    testResults.tests.push({ name: 'Analyze App', ...analyzeResult });
    analyzeResult.success ? testResults.passed++ : testResults.failed++;

    if (!analyzeResult.success) {
        console.log('\n❌ Analysis failed. Cannot continue with remaining tests.');
        printSummary(testResults);
        return;
    }

    const appId = analyzeResult.data.appId;
    console.log(`\n📱 Resolved App ID: ${appId}`);

    // Test 3: Wait for scraping to complete
    console.log('\n═══════════════════════════════════════');
    console.log('TEST 3: Wait for Scraping (10 seconds)');
    console.log('═══════════════════════════════════════');
    console.log('⏳ Waiting for background scraping to complete...');

    for (let i = 10; i > 0; i--) {
        process.stdout.write(`\r   ${i} seconds remaining...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n   ✅ Wait complete');

    // Test 4: Get Results
    console.log('\n═══════════════════════════════════════');
    console.log('TEST 4: Retrieve Scraped Data');
    console.log('═══════════════════════════════════════');
    const resultsCheck = await testEndpoint(
        'Get Results',
        'GET',
        `/api/results/${appId}`
    );
    testResults.tests.push({ name: 'Get Results', ...resultsCheck });
    resultsCheck.success ? testResults.passed++ : testResults.failed++;

    if (resultsCheck.success) {
        const { metadata, reviews } = resultsCheck.data;
        console.log(`\n   📊 Data Summary:`);
        console.log(`      App: ${metadata?.title || 'N/A'}`);
        console.log(`      Rating: ${metadata?.score || 'N/A'}`);
        console.log(`      Reviews Count: ${reviews?.length || 0}`);
        console.log(`      Developer: ${metadata?.developer || 'N/A'}`);
    }

    // Test 5: Cache Test (should return immediately)
    console.log('\n═══════════════════════════════════════');
    console.log('TEST 5: Cache Validation');
    console.log('═══════════════════════════════════════');
    const cacheTest = await testEndpoint(
        'Analyze Same App (Cache)',
        'POST',
        '/api/analyze',
        { term: appId } // Use appId directly to test cache
    );
    testResults.tests.push({ name: 'Cache Test', ...cacheTest });
    cacheTest.success ? testResults.passed++ : testResults.failed++;

    if (cacheTest.success && cacheTest.data.status === 'completed') {
        console.log('   ✅ Cache is working! Data returned immediately.');
    } else {
        console.log('   ⚠️  Cache might not be working as expected.');
    }

    // Print Summary
    printSummary(testResults);
}

function printSummary(results) {
    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Total Tests: ${results.passed + results.failed}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.success).forEach(test => {
            console.log(`   - ${test.name}`);
        });
    }

    console.log('\n═══════════════════════════════════════\n');
}

// Run tests
runTests().catch(error => {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
});
