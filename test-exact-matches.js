const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

async function testExactMatches() {
    console.log('🔍 Testing what names would match for these companies:\n');
    
    // Test various name variations
    const nameVariations = [
        // Sberbank variations
        'SBERBANK CIB (UK) LIMITED',
        'SBERBANK CIB',
        'SBERBANK',
        'Sberbank',
        'Sberbank of Russia',
        
        // VTB variations
        'VTB CAPITAL PLC',
        'VTB CAPITAL',
        'VTB',
        'VTB Bank',
        'Bank VTB'
    ];
    
    for (const name of nameVariations) {
        try {
            const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(name)}`);
            const data = await response.json();
            
            console.log(`"${name}"`);
            if (data.status === 'success' && data.data) {
                if (data.data.sanctioned) {
                    console.log(`  ✅ SANCTIONED - Lists: ${data.data.lists.join(', ')}`);
                    if (data.data.matchedName) {
                        console.log(`  Matched as: "${data.data.matchedName}"`);
                    }
                } else {
                    console.log(`  ❌ NOT SANCTIONED`);
                }
            }
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n\nCONCLUSION:');
    console.log('The API currently requires exact or very close name matches.');
    console.log('UK subsidiaries with different names are not being matched to their sanctioned parents.');
}

testExactMatches().catch(console.error);