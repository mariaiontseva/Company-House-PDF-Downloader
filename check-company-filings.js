const axios = require('axios');

const CH_API_KEY = 'ee8f2dc2-17d8-4fc9-98bc-ad5c554a11f1';
const companyNumber = '09051662';

async function checkFilings() {
    try {
        // Get filing history
        const response = await axios.get(
            `https://api.companieshouse.gov.uk/company/${companyNumber}/filing-history`,
            {
                auth: {
                    username: CH_API_KEY,
                    password: ''
                },
                params: {
                    category: 'accounts',
                    items_per_page: 100
                }
            }
        );
        
        console.log(`Total filings: ${response.data.total_count}`);
        console.log('\nAccounts filings:');
        
        response.data.items.forEach((filing, index) => {
            if (filing.category === 'accounts') {
                console.log(`\n${index + 1}. ${filing.date} - ${filing.description}`);
                console.log(`   Type: ${filing.type}`);
                console.log(`   Transaction ID: ${filing.transaction_id}`);
                console.log(`   Paper filed: ${filing.paper_filed || false}`);
                console.log(`   Links:`, JSON.stringify(filing.links, null, 2));
                
                // Check for associated filings
                if (filing.associated_filings) {
                    console.log('   Associated filings:', filing.associated_filings);
                }
                
                // Check resources
                if (filing.resources) {
                    console.log('   Resources:', JSON.stringify(filing.resources, null, 2));
                }
            }
        });
        
        // Try to get the latest accounts filing metadata
        const latestAccounts = response.data.items.find(f => f.category === 'accounts');
        if (latestAccounts && latestAccounts.links && latestAccounts.links.document_metadata) {
            console.log('\n\nFetching metadata for latest accounts...');
            const metadataResponse = await axios.get(
                latestAccounts.links.document_metadata,
                {
                    auth: {
                        username: CH_API_KEY,
                        password: ''
                    }
                }
            );
            console.log('Metadata:', JSON.stringify(metadataResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

checkFilings();