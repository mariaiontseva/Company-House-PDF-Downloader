const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

async function testProductionSanctions() {
    console.log('🔍 TESTING SANCTIONS API IN PRODUCTION\n');
    
    // First check deployment version
    const healthResponse = await fetch(`${PROXY_URL}/health`);
    const health = await healthResponse.json();
    console.log(`Deployment version: ${health.version}`);
    console.log(`Last deployed: ${health.deployedAt}\n`);
    
    if (health.version !== '3.2-multi-result-scanning') {
        console.log('⏳ Waiting for new deployment... Current version:', health.version);
        console.log('Please wait for Railway to complete deployment.\n');
    }
    
    // Test companies
    const testCompanies = [
        { name: 'SBERBANK CIB (UK) LIMITED', number: '04783112', expected: true },
        { name: 'VTB CAPITAL PLC', number: '02577764', expected: true },
        { name: 'APPLE INC', number: '12345678', expected: false },
        { name: 'SBERBANK', number: 'N/A', expected: true },
        { name: 'VTB', number: 'N/A', expected: true }
    ];
    
    console.log('Testing companies:\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const company of testCompanies) {
        console.log(`Testing: ${company.name}`);
        
        try {
            const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(company.name)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                const isSanctioned = data.data.sanctioned;
                const isCorrect = isSanctioned === company.expected;
                
                if (isCorrect) {
                    console.log(`  ✅ PASS - ${isSanctioned ? 'Sanctioned' : 'Not sanctioned'} (as expected)`);
                    if (isSanctioned) {
                        console.log(`     Lists: ${data.data.lists.join(', ')}`);
                        console.log(`     Matched: ${data.data.matchedName}`);
                    }
                    passed++;
                } else {
                    console.log(`  ❌ FAIL - ${isSanctioned ? 'Sanctioned' : 'Not sanctioned'} (expected ${company.expected ? 'sanctioned' : 'not sanctioned'})`);
                    failed++;
                }
                
                if (company.number !== 'N/A' && isSanctioned) {
                    console.log(`     Test URL: https://docspace.uk/#company/${company.number}`);
                }
            } else {
                console.log(`  ❌ API Error:`, data);
                failed++;
            }
        } catch (error) {
            console.log(`  ❌ Request failed:`, error.message);
            failed++;
        }
        
        console.log('');
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== TEST RESULTS ===');
    console.log(`Passed: ${passed}/${testCompanies.length}`);
    console.log(`Failed: ${failed}/${testCompanies.length}`);
    
    if (failed === 0) {
        console.log('\n✅ All tests passed! The sanctions API is working correctly.');
        console.log('\nYou can now test on docspace.uk:');
        console.log('- https://docspace.uk/#company/04783112 (SBERBANK CIB)');
        console.log('- https://docspace.uk/#company/02577764 (VTB CAPITAL)');
    } else {
        console.log('\n❌ Some tests failed. Please check the implementation.');
    }
}

testProductionSanctions().catch(console.error);