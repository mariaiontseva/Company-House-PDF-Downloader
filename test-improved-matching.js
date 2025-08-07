const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

async function testImprovedMatching() {
    console.log('🔍 TESTING IMPROVED SANCTIONS MATCHING\n');
    
    const testCompanies = [
        { name: 'SBERBANK CIB (UK) LIMITED', number: '04783112' },
        { name: 'VTB CAPITAL PLC', number: '02577764' },
        { name: 'VEB.RF LONDON BRANCH', number: '12345678' }
    ];
    
    console.log('Testing with UK subsidiary names that should match parent companies:\n');
    
    for (const company of testCompanies) {
        console.log(`Company: ${company.name}`);
        
        try {
            const response = await fetch(`${PROXY_URL}/api/sanctions/check/${encodeURIComponent(company.name)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                if (data.data.sanctioned) {
                    console.log(`  ✅ SANCTIONED`);
                    console.log(`  Parent match: ${data.data.matchedName}`);
                    console.log(`  Lists: ${data.data.lists.join(', ')}`);
                    console.log(`  Test URL: https://docspace.uk/#company/${company.number}`);
                } else {
                    console.log(`  ❌ NOT SANCTIONED`);
                }
            } else {
                console.log(`  ❌ API Error:`, data);
            }
        } catch (error) {
            console.log(`  ❌ Request failed:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Run locally first
const localFetch = require('node-fetch');

// Test the name extraction logic locally
function extractCoreName(name) {
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
    if (coreName.includes('BANK')) {
        coreName = coreName.replace(/\s+BANK\s*/gi, '').trim();
    }
    
    return coreName;
}

console.log('\nLocal name extraction tests:');
console.log('SBERBANK CIB (UK) LIMITED -> ' + extractCoreName('SBERBANK CIB (UK) LIMITED'));
console.log('VTB CAPITAL PLC -> ' + extractCoreName('VTB CAPITAL PLC'));
console.log('VEB.RF LONDON BRANCH -> ' + extractCoreName('VEB.RF LONDON BRANCH'));

console.log('\nNow testing against deployed API:\n');

testImprovedMatching().catch(console.error);