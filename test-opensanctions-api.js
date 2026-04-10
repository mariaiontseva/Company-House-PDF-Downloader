const fetch = require('node-fetch');

async function testOpenSanctionsAPI() {
    const apiKey = '655046606e62014766354db22d62488c';
    
    console.log('Testing OpenSanctions API directly with multiple names:\n');
    
    // Test with multiple names in one query
    const response = await fetch('https://api.opensanctions.org/match/default', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            queries: {
                q1: {
                    schema: 'LegalEntity',
                    properties: {
                        name: ['SBERBANK CIB (UK) LIMITED', 'SBERBANK']
                    }
                }
            }
        })
    });
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    // Check if it found a match
    const results = data.responses?.q1?.results || [];
    if (results.length > 0) {
        console.log('\n✅ MATCH FOUND');
        console.log('Matched entity:', results[0].caption);
        console.log('Score:', results[0].score);
        console.log('Datasets:', results[0].datasets);
    } else {
        console.log('\n❌ NO MATCH FOUND');
    }
}

testOpenSanctionsAPI().catch(console.error);