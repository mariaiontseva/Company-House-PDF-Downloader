const fetch = require('node-fetch');

const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

// Companies potentially linked to sanctioned individuals
const POTENTIAL_COMPANIES = [
    // Known Russian-linked companies
    { number: '05059466', name: 'EVRAZ PLC' },
    { number: '04270505', name: 'MILLHOUSE CAPITAL UK LTD' },
    { number: '06201528', name: 'CHELSEA FOOTBALL CLUB PLC' },
    { number: '07311961', name: 'FORDSTAM LIMITED' },
    { number: '08589217', name: 'HANSON ASSET MANAGEMENT LIMITED' },
    { number: '10228376', name: 'MHC SERVICES LIMITED' },
    { number: '11151451', name: 'ERVINGTON INVESTMENTS LIMITED' },
    { number: '10917472', name: 'NOREBO EUROPE LIMITED' },
    { number: '06582879', name: 'CAMBOURNE CAPITAL LIMITED' },
    { number: '03767160', name: 'GREENLEAS INTERNATIONAL HOLDINGS LIMITED' },
    // Energy and commodities companies
    { number: '03820971', name: 'TNK-BP COMMERCE LIMITED' },
    { number: '09715596', name: 'EN+ GROUP PLC' },
    { number: '06131383', name: 'LONDON OIL & GAS LIMITED' },
    { number: '04381506', name: 'RUSAL MARKETING GMBH UK BRANCH' },
    // Investment companies
    { number: '08704172', name: 'LETTERONE HOLDINGS S.A.' },
    { number: '08420868', name: 'L1 RETAIL HOLDINGS S.A.' },
    { number: '07062248', name: 'ALFA CAPITAL HOLDINGS (CYPRUS) LIMITED' }
];

async function getCompanyOfficers(companyNumber) {
    try {
        const url = `${PROXY_URL}/api/proxy/companies-house/company/${companyNumber}/officers`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            return data.items || [];
        }
        return [];
    } catch (error) {
        return [];
    }
}

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
        return null;
    }
}

async function findCompaniesWithSanctionedDirectors() {
    console.log('🔍 SEARCHING FOR UK COMPANIES WITH SANCTIONED DIRECTORS\n');
    console.log('Checking companies potentially linked to sanctioned individuals...\n');
    
    const results = [];
    
    for (const company of POTENTIAL_COMPANIES) {
        console.log(`\nChecking ${company.name} (${company.number})`);
        
        // Get company officers
        const officers = await getCompanyOfficers(company.number);
        
        if (officers.length === 0) {
            console.log('  No officers data available');
            continue;
        }
        
        console.log(`  Found ${officers.length} officers`);
        
        const sanctionedOfficers = [];
        
        // Check each officer
        for (const officer of officers) {
            if (!officer.name || officer.resigned_on) continue;
            
            const sanctions = await checkIfSanctioned(officer.name);
            
            if (sanctions && sanctions.sanctioned) {
                console.log(`  ✅ SANCTIONED: ${officer.name}`);
                console.log(`     Role: ${officer.officer_role}`);
                console.log(`     Lists: ${sanctions.lists.join(', ')}`);
                
                sanctionedOfficers.push({
                    name: officer.name,
                    role: officer.officer_role,
                    appointed: officer.appointed_on,
                    sanctions: sanctions.lists
                });
            }
        }
        
        if (sanctionedOfficers.length > 0) {
            console.log(`\n  🎯 FOUND COMPANY WITH ${sanctionedOfficers.length} SANCTIONED DIRECTOR(S)`);
            console.log(`  Test URL: https://docspace.uk/#company/${company.number}`);
            
            results.push({
                company: company,
                sanctionedOfficers: sanctionedOfficers
            });
        }
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n\n=== RESULTS SUMMARY ===\n');
    
    if (results.length > 0) {
        console.log(`Found ${results.length} companies with sanctioned directors:\n`);
        
        results.forEach(result => {
            console.log(`${result.company.name}`);
            console.log(`Company Number: ${result.company.number}`);
            console.log(`Test URL: https://docspace.uk/#company/${result.company.number}`);
            console.log('Sanctioned Directors:');
            
            result.sanctionedOfficers.forEach(officer => {
                console.log(`  - ${officer.name} (${officer.role})`);
                console.log(`    Sanctions: ${officer.sanctions.join(', ')}`);
            });
            console.log('');
        });
        
        console.log('\nYou can test these on docspace.uk by:');
        console.log('1. Going to the company page');
        console.log('2. Clicking on the "People" tab');
        console.log('3. The sanctioned directors should show red sanctions badges');
    } else {
        console.log('No companies found with currently sanctioned directors.');
        console.log('\nNote: Many sanctioned individuals have resigned from UK boards.');
    }
}

findCompaniesWithSanctionedDirectors().catch(console.error);