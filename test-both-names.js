const fetch = require('node-fetch');

async function testBothNames() {
    const apiKey = '655046606e62014766354db22d62488c';
    
    console.log('🔍 TESTING WITH BOTH FULL AND CORE NAMES\n');
    
    const testName = 'VTB CAPITAL PLC';
    const coreName = 'VTB';
    
    // Test with BOTH names in a single query
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
                        name: [testName, coreName]  // Send both names
                    }
                }
            }
        })
    });
    
    const data = await response.json();
    const results = data.responses?.q1?.results || [];
    
    console.log(`Query names: ["${testName}", "${coreName}"]`);
    console.log(`Found ${results.length} results\n`);
    
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
    
    let sanctionedFound = false;
    
    results.forEach((result, index) => {
        console.log(`Result ${index + 1}: ${result.caption} (score: ${result.score})`);
        
        const sanctionLists = result.datasets.filter(dataset => 
            sanctionsDatasets.some(sanctionDs => dataset.includes(sanctionDs))
        );
        
        if (sanctionLists.length > 0) {
            console.log(`  ✅ SANCTIONED - Lists: ${sanctionLists.join(', ')}`);
            sanctionedFound = true;
        } else {
            console.log(`  ❌ NOT SANCTIONED`);
        }
    });
    
    console.log(`\n${sanctionedFound ? '✅ At least one sanctioned entity found' : '❌ No sanctioned entities found'}`);
}

testBothNames().catch(console.error);