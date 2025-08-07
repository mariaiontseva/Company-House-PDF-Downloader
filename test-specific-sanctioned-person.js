const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

// Let's check if specific known sanctioned individuals are detected
const KNOWN_SANCTIONED = [
    'Roman Abramovich',
    'Eugene Tenenbaum', 
    'David Davidovich',
    'Eugene Shvidler',
    'Alexander Abramov',
    'Alexander Frolov',
    'Oleg Deripaska',
    'German Khan',
    'Mikhail Fridman',
    'Petr Aven'
];

async function checkIfSanctioned(name) {
    try {
        const response = await fetch(
            `${PROXY_URL}/api/sanctions/check/${encodeURIComponent(name)}`
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.data;
        }
        return null;
    } catch (error) {
        console.error(`Error checking ${name}:`, error.message);
        return null;
    }
}

async function testSanctionsAPI() {
    console.log('🔍 TESTING SANCTIONS API WITH KNOWN SANCTIONED INDIVIDUALS\n');
    
    const sanctioned = [];
    
    for (const name of KNOWN_SANCTIONED) {
        console.log(`Checking: ${name}`);
        const result = await checkIfSanctioned(name);
        
        if (result && result.sanctioned) {
            console.log(`  ✅ SANCTIONED`);
            console.log(`  Lists: ${result.lists.join(', ')}`);
            console.log(`  Score: ${result.score}`);
            sanctioned.push({ name, ...result });
        } else {
            console.log(`  ❌ Not found on sanctions lists`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n\n=== SANCTIONED INDIVIDUALS CONFIRMED ===\n');
    
    if (sanctioned.length > 0) {
        console.log('The following individuals are confirmed sanctioned:\n');
        sanctioned.forEach(person => {
            console.log(`${person.name}`);
            console.log(`  Sanctions lists: ${person.lists.join(', ')}`);
            console.log(`  Match score: ${person.score}\n`);
        });
        
        console.log('\nNow let me check specific companies where these individuals might be directors...');
        
        // Check specific companies
        const companies = [
            { number: '07311961', name: 'FORDSTAM LIMITED' },
            { number: '08589217', name: 'HANSON ASSET MANAGEMENT LIMITED' },
            { number: '10228376', name: 'MHC SERVICES LIMITED' }
        ];
        
        console.log('\nChecking companies for sanctioned directors:\n');
        
        for (const company of companies) {
            console.log(`Company: ${company.name} (${company.number})`);
            console.log(`URL: https://docspace.uk/#company/${company.number}`);
            console.log('Navigate to the People tab to see if any directors show sanctions badges.\n');
        }
    }
}

testSanctionsAPI().catch(console.error);