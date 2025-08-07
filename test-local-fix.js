const fetch = require('node-fetch');

async function testLocalFix() {
    const apiKey = '655046606e62014766354db22d62488c';
    
    console.log('🔍 TESTING FIX LOCALLY\n');
    
    // Test VTB CAPITAL PLC
    const testName = 'VTB CAPITAL PLC';
    console.log(`Testing: ${testName}\n`);
    
    // First, let's see what OpenSanctions returns
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
                        name: [testName]
                    }
                }
            }
        })
    });
    
    const data = await response.json();
    const results = data.responses?.q1?.results || [];
    
    console.log(`Found ${results.length} results:\n`);
    
    // Define sanctions datasets
    const sanctionsDatasets = [
        'us_ofac_sdn', 'us_ofac_cons', 'us_trade_csl',
        'gb_hmt_sanctions', 'gb_fcdo_sanctions',
        'eu_fsf', 'eu_eeas_sanctions', 'eu_journal_sanctions', 'eu_sanctions_map',
        'un_sc_sanctions',
        'ch_seco_sanctions',
        'au_dfat_sanctions',
        'ca_dfatd_sema_sanctions',
        'jp_meti_eul', 'jp_mof_sanctions',
        'ua_nsdc_sanctions', 'nz_russia_sanctions', 'tw_shtc'
    ];
    
    results.forEach((result, index) => {
        console.log(`Result ${index + 1}:`);
        console.log(`  Name: ${result.caption}`);
        console.log(`  Score: ${result.score}`);
        console.log(`  Datasets: ${result.datasets.join(', ')}`);
        
        const sanctionLists = result.datasets.filter(dataset => 
            sanctionsDatasets.some(sanctionDs => dataset.includes(sanctionDs))
        );
        
        if (sanctionLists.length > 0) {
            console.log(`  ✅ SANCTIONED - Lists: ${sanctionLists.join(', ')}`);
        } else {
            console.log(`  ❌ NOT SANCTIONED`);
        }
        console.log('');
    });
    
    // Now let's test the extraction logic
    console.log('\n--- Testing name extraction logic ---\n');
    
    let coreName = testName
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
    if (coreName.includes('BANK')) {
        coreName = coreName.replace(/\s+BANK\s*/gi, '').trim();
    }
    
    console.log(`Original name: "${testName}"`);
    console.log(`Core name extracted: "${coreName}"`);
    
    // Test with core name
    console.log(`\nTesting with core name "${coreName}":\n`);
    
    const coreResponse = await fetch('https://api.opensanctions.org/match/default', {
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
                        name: [coreName]
                    }
                }
            }
        })
    });
    
    const coreData = await coreResponse.json();
    const coreResults = coreData.responses?.q1?.results || [];
    
    if (coreResults.length > 0 && coreResults[0].score > 0.7) {
        const sanctionLists = coreResults[0].datasets.filter(dataset => 
            sanctionsDatasets.some(sanctionDs => dataset.includes(sanctionDs))
        );
        
        if (sanctionLists.length > 0) {
            console.log(`✅ Core name matches sanctioned entity: ${coreResults[0].caption}`);
            console.log(`   Sanctions lists: ${sanctionLists.join(', ')}`);
        }
    }
}

testLocalFix().catch(console.error);