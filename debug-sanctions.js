const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

async function debugSanctionsAPI() {
    console.log('🔍 DEBUGGING SANCTIONS API\n');
    
    // Test companies
    const testCompanies = [
        'Sberbank',
        'Apple Inc',
        'Google LLC',
        'Rosneft',
        'VEB.RF'
    ];
    
    console.log('1. Testing API health check:');
    try {
        const healthResponse = await fetch(`${PROXY_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    console.log('\n2. Testing sanctions endpoint:');
    
    for (const company of testCompanies) {
        console.log(`\nChecking: ${company}`);
        try {
            const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(company)}`);
            
            console.log(`  Status: ${response.status}`);
            console.log(`  Headers:`, {
                'content-type': response.headers.get('content-type'),
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'x-match-score': response.headers.get('x-match-score')
            });
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                if (data.data.sanctioned) {
                    console.log(`  ✅ SANCTIONED`);
                    console.log(`  Lists: ${data.data.lists.join(', ')}`);
                    console.log(`  Match Score: ${data.data.matchScore}`);
                } else {
                    console.log(`  ✅ NOT SANCTIONED`);
                }
            } else {
                console.log(`  ❌ API Error:`, data);
            }
        } catch (error) {
            console.log(`  ❌ Request failed:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n3. Testing CORS from browser context:');
    console.log('The API should have these headers:');
    console.log('  - Access-Control-Allow-Origin: *');
    console.log('  - Content-Type: application/json');
    
    console.log('\n4. Testing with exact company numbers from docspace.uk:');
    const ukCompanies = [
        { name: 'SBERBANK CIB (UK) LIMITED', number: '04783112' },
        { name: 'VTB CAPITAL PLC', number: '02577764' }
    ];
    
    for (const company of ukCompanies) {
        console.log(`\nChecking: ${company.name} (${company.number})`);
        try {
            const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(company.name)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data && data.data.sanctioned) {
                console.log(`  ✅ SANCTIONED - Test at: https://docspace.uk/#company/${company.number}`);
                console.log(`  Lists: ${data.data.lists.join(', ')}`);
            } else {
                console.log(`  ❌ NOT showing as sanctioned`);
            }
        } catch (error) {
            console.log(`  ❌ Request failed:`, error.message);
        }
    }
}

debugSanctionsAPI().catch(console.error);