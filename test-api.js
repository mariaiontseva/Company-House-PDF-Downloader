const fetch = require('node-fetch');

// Test configuration
const API_KEY = '655046606e62014766354db22d62488c';
const BASE_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

// Test companies that should be sanctioned
const SANCTIONED_COMPANIES = [
    'Wagner Group',
    'Sberbank',
    'PAO Gazprom',  // Changed from just Gazprom
    'Rosneft',
    'VTB Bank PJSC',  // Changed from just VTB Bank
    'Alfa Bank',
    'Bank Otkritie',
    'Sovcombank',
    'VEB.RF',
    'Russian Agricultural Bank'
];

// Test companies that should NOT be sanctioned
const NON_SANCTIONED_COMPANIES = [
    'Apple Inc',
    'Microsoft Corporation',
    'Google LLC',
    'Amazon',
    'Tesla Inc'
];

async function testHealth() {
    console.log(colors.cyan + '\n=== Testing Health Endpoint ===' + colors.reset);
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('Health check:', data);
        
        if (data.hasOpenSanctionsKey) {
            console.log(colors.green + '✓ OpenSanctions API key is configured' + colors.reset);
        } else {
            console.log(colors.yellow + '⚠ OpenSanctions API key NOT found in environment' + colors.reset);
        }
        
        if (data.version) {
            console.log(`Version: ${data.version}`);
        }
    } catch (error) {
        console.log(colors.red + '✗ Health check failed:' + colors.reset, error.message);
    }
}

async function testSanctionsAPI(companyName, shouldBeSanctioned) {
    try {
        const response = await fetch(`${BASE_URL}/api/sanctions/check/${encodeURIComponent(companyName)}`);
        const data = await response.json();
        
        if (!response.ok) {
            console.log(colors.red + `✗ ${companyName}: API Error - ${data.message || data.error}` + colors.reset);
            return false;
        }
        
        const isSanctioned = data.data?.sanctioned;
        const source = data.data?.source;
        const lists = data.data?.lists || [];
        const matchScore = data.data?.matchScore;
        
        // Check if using real API
        if (source === 'simulated') {
            console.log(colors.yellow + `⚠ ${companyName}: Using SIMULATED data (not real API)` + colors.reset);
            return false;
        }
        
        // Check if sanctions status matches expectation
        if (isSanctioned === shouldBeSanctioned) {
            console.log(colors.green + `✓ ${companyName}: ${isSanctioned ? 'Sanctioned' : 'Not sanctioned'} (${source})` + colors.reset);
            if (isSanctioned) {
                console.log(`  Lists: ${lists.join(', ')}`);
                if (matchScore) console.log(`  Match score: ${matchScore}`);
            }
            return true;
        } else {
            console.log(colors.red + `✗ ${companyName}: Expected ${shouldBeSanctioned ? 'sanctioned' : 'not sanctioned'}, got ${isSanctioned ? 'sanctioned' : 'not sanctioned'}` + colors.reset);
            return false;
        }
    } catch (error) {
        console.log(colors.red + `✗ ${companyName}: Request failed - ${error.message}` + colors.reset);
        return false;
    }
}

async function testDirectAPI() {
    console.log(colors.cyan + '\n=== Testing Direct OpenSanctions API ===' + colors.reset);
    try {
        const response = await fetch('https://api.opensanctions.org/match/default', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                queries: {
                    q1: {
                        schema: 'LegalEntity',
                        properties: {
                            name: ['Wagner Group']
                        }
                    }
                }
            })
        });
        
        if (response.ok) {
            console.log(colors.green + '✓ Direct API call successful' + colors.reset);
            const data = await response.json();
            const results = data.responses?.q1?.results || [];
            console.log(`  Found ${results.length} matches`);
            if (results[0]) {
                console.log(`  Top match: ${results[0].caption} (score: ${results[0].score})`);
            }
        } else {
            console.log(colors.red + '✗ Direct API call failed:' + colors.reset, response.status);
        }
    } catch (error) {
        console.log(colors.red + '✗ Direct API test failed:' + colors.reset, error.message);
    }
}

async function runAllTests() {
    console.log(colors.cyan + '\n====== SANCTIONS API TEST SUITE ======' + colors.reset);
    console.log(`Testing against: ${BASE_URL}`);
    console.log(`Time: ${new Date().toISOString()}`);
    
    // Test health endpoint
    await testHealth();
    
    // Test direct API
    await testDirectAPI();
    
    // Test sanctioned companies
    console.log(colors.cyan + '\n=== Testing Sanctioned Companies ===' + colors.reset);
    let sanctionedPassed = 0;
    for (const company of SANCTIONED_COMPANIES) {
        const passed = await testSanctionsAPI(company, true);
        if (passed) sanctionedPassed++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    }
    
    // Test non-sanctioned companies
    console.log(colors.cyan + '\n=== Testing Non-Sanctioned Companies ===' + colors.reset);
    let nonSanctionedPassed = 0;
    for (const company of NON_SANCTIONED_COMPANIES) {
        const passed = await testSanctionsAPI(company, false);
        if (passed) nonSanctionedPassed++;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Summary
    console.log(colors.cyan + '\n=== TEST SUMMARY ===' + colors.reset);
    console.log(`Sanctioned companies: ${sanctionedPassed}/${SANCTIONED_COMPANIES.length} passed`);
    console.log(`Non-sanctioned companies: ${nonSanctionedPassed}/${NON_SANCTIONED_COMPANIES.length} passed`);
    
    const totalPassed = sanctionedPassed + nonSanctionedPassed;
    const totalTests = SANCTIONED_COMPANIES.length + NON_SANCTIONED_COMPANIES.length;
    
    if (totalPassed === totalTests) {
        console.log(colors.green + `\n✓ ALL TESTS PASSED! (${totalPassed}/${totalTests})` + colors.reset);
    } else {
        console.log(colors.red + `\n✗ TESTS FAILED: ${totalPassed}/${totalTests} passed` + colors.reset);
    }
}

// Run tests
runAllTests().catch(console.error);