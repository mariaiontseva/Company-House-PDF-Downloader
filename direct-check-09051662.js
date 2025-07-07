const axios = require('axios');
const fs = require('fs');

async function checkEmployees() {
    const companyNumber = '09051662';
    
    try {
        // Get latest filing through proxy
        const filingResponse = await axios.get(`http://localhost:3002/api/proxy`, {
            params: {
                url: `https://api.companieshouse.gov.uk/company/${companyNumber}/filing-history?category=accounts&items_per_page=5`
            }
        });
        
        const latestAccounts = filingResponse.data.items.find(f => f.category === 'accounts');
        console.log(`Latest accounts: ${latestAccounts.date} - ${latestAccounts.description}`);
        console.log(`Transaction ID: ${latestAccounts.transaction_id}`);
        
        // Get the iXBRL document
        const xbrlResponse = await axios.get(`http://localhost:3002/api/proxy/ixbrl/${companyNumber}/${latestAccounts.transaction_id}`, {
            params: { format: 'xhtml' }
        });
        
        const xbrlText = xbrlResponse.data;
        
        // Search for employee data
        const employeeRegex = /name="[^"]*AverageNumberEmployeesDuringPeriod[^"]*"[^>]*scale="(\d+)"[^>]*>([^<]+)</gi;
        const matches = [...xbrlText.matchAll(employeeRegex)];
        
        console.log('\nEmployee data found:');
        matches.forEach(match => {
            const scale = match[1];
            const value = match[2].trim();
            console.log(`- Raw value: ${value}`);
            console.log(`- Scale attribute: ${scale}`);
            console.log(`- Would be multiplied by: ${Math.pow(10, parseInt(scale))}`);
            console.log(`- Incorrect calculation: ${value} × ${Math.pow(10, parseInt(scale))} = ${parseInt(value) * Math.pow(10, parseInt(scale))}`);
            console.log(`- Correct value should be: ${value}`);
        });
        
        // Also search without scale requirement
        const simpleRegex = /AverageNumberEmployeesDuringPeriod[^>]*>([^<]+)</gi;
        const simpleMatches = [...xbrlText.matchAll(simpleRegex)];
        
        console.log('\nAll employee entries:');
        simpleMatches.forEach((match, i) => {
            console.log(`${i + 1}. ${match[1].trim()}`);
        });
        
        // Save a sample for inspection
        fs.writeFileSync('sample-09051662.html', xbrlText.substring(0, 50000));
        console.log('\nSaved first 50KB to sample-09051662.html for inspection');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkEmployees();