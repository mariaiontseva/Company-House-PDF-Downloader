const fetch = require('node-fetch');

// Known sanctioned individuals who might be UK company directors
const SANCTIONED_INDIVIDUALS = [
    'Roman Abramovich',
    'Oleg Deripaska',
    'Mikhail Fridman',
    'Petr Aven',
    'German Khan',
    'Alexey Mordashov',
    'Alisher Usmanov',
    'Viktor Vekselberg',
    'Eugene Shvidler',
    'Alexander Ponomarenko',
    'Andrey Kosogov',
    'Igor Shuvalov',
    'Mikhail Shelomov'
];

const API_KEY = '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';
const PROXY_URL = 'https://company-house-pdf-downloader-production-1eb5.up.railway.app';

async function searchOfficer(name) {
    try {
        const url = `${PROXY_URL}/api/proxy/companies-house/search/officers?q=${encodeURIComponent(name)}&items_per_page=20`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            return data.items || [];
        }
        return [];
    } catch (error) {
        console.error(`Error searching for ${name}:`, error.message);
        return [];
    }
}

async function checkIfSanctioned(name) {
    try {
        const response = await fetch(
            `https://company-house-pdf-downloader-production-1eb5.up.railway.app/api/sanctions/check/${encodeURIComponent(name)}`
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

async function getOfficerAppointments(officerId) {
    try {
        const url = `${PROXY_URL}/api/proxy/companies-house/officers/${officerId}/appointments`;
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

async function findSanctionedDirectors() {
    console.log('🔍 SEARCHING FOR UK DIRECTORS UNDER SANCTIONS\n');
    console.log('This may take a few minutes...\n');
    
    const foundDirectors = [];
    
    for (const name of SANCTIONED_INDIVIDUALS) {
        console.log(`\nChecking: ${name}`);
        
        // First check if they're sanctioned
        const sanctions = await checkIfSanctioned(name);
        if (!sanctions || !sanctions.sanctioned) {
            console.log('  ❌ Not on sanctions list');
            continue;
        }
        
        console.log(`  ✅ SANCTIONED (${sanctions.lists.join(', ')})`);
        
        // Search for them as UK officers
        const officers = await searchOfficer(name);
        
        if (officers.length === 0) {
            console.log('  📭 No UK directorships found');
            continue;
        }
        
        console.log(`  📋 Found ${officers.length} officer records`);
        
        for (const officer of officers) {
            // Extract officer ID from links
            let officerId = null;
            if (officer.links && officer.links.self) {
                const matches = officer.links.self.match(/\/officers\/([^\/]+)\//); 
                officerId = matches ? matches[1] : null;
            }
            
            if (!officerId) continue;
            
            // Get their appointments
            const appointments = await getOfficerAppointments(officerId);
            const activeAppointments = appointments.filter(app => !app.resigned_on);
            
            if (activeAppointments.length > 0) {
                console.log(`\n  🎯 FOUND: ${officer.title}`);
                console.log(`  Officer ID: ${officerId}`);
                console.log(`  Active appointments: ${activeAppointments.length}`);
                
                // Show first few active companies
                activeAppointments.slice(0, 3).forEach(app => {
                    console.log(`    - ${app.appointed_to.company_name} (${app.appointed_to.company_number})`);
                });
                
                foundDirectors.push({
                    name: officer.title,
                    officerId: officerId,
                    sanctions: sanctions.lists,
                    activeCompanies: activeAppointments.map(app => ({
                        name: app.appointed_to.company_name,
                        number: app.appointed_to.company_number
                    }))
                });
            }
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n\n=== SUMMARY ===');
    if (foundDirectors.length > 0) {
        console.log(`\nFound ${foundDirectors.length} sanctioned individuals with active UK directorships:\n`);
        
        foundDirectors.forEach(director => {
            console.log(`${director.name}`);
            console.log(`  Sanctions: ${director.sanctions.join(', ')}`);
            console.log(`  Test on docspace.uk:`);
            director.activeCompanies.slice(0, 2).forEach(company => {
                console.log(`    https://docspace.uk/#company/${company.number}`);
            });
            console.log('');
        });
    } else {
        console.log('\nNo sanctioned individuals found with active UK directorships.');
        console.log('\nNote: Most sanctioned individuals have resigned from UK boards.');
    }
}

findSanctionedDirectors().catch(console.error);