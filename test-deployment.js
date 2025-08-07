const fetch = require('node-fetch');

async function testDeployment() {
    const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';
    
    // First check version
    const healthResponse = await fetch(`${PROXY_URL}/health`);
    const health = await healthResponse.json();
    console.log('Deployment version:', health.version);
    console.log('Deployed at:', health.deployedAt);
    
    // Test the problematic companies
    console.log('\nTesting company name matching:\n');
    
    const testCases = [
        'SBERBANK CIB (UK) LIMITED',
        'VTB CAPITAL PLC'
    ];
    
    for (const name of testCases) {
        console.log(`Testing: "${name}"`);
        const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(name)}`);
        const data = await response.json();
        
        if (data.data && data.data.sanctioned) {
            console.log('  ✅ SANCTIONED');
            console.log('  Lists:', data.data.lists.join(', '));
        } else {
            console.log('  ❌ NOT SANCTIONED');
            
            // Now test what the core name extraction should produce
            let coreName = name
                .replace(/\s*\(UK\)\s*/gi, ' ')
                .replace(/\s+(LIMITED|LTD|PLC|LLP|LP|INC|LLC|CORP|CORPORATION)\.?$/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (coreName.includes('CIB')) {
                coreName = coreName.replace(/\s+CIB\s*/gi, '').trim();
            }
            if (coreName.includes('CAPITAL')) {
                coreName = coreName.replace(/\s+CAPITAL\s*/gi, '').trim();
            }
            
            console.log(`  Core name should be: "${coreName}"`);
            
            // Test if core name would match
            const coreResponse = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(coreName)}`);
            const coreData = await coreResponse.json();
            
            if (coreData.data && coreData.data.sanctioned) {
                console.log(`  ✅ Core name "${coreName}" IS SANCTIONED`);
                console.log('  This means the extraction logic is not working on the server');
            }
        }
        
        console.log('');
    }
}

testDeployment().catch(console.error);