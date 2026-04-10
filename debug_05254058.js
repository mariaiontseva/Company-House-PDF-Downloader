// Debug script to test company 05254058 XBRL extraction

async function debugCompany05254058() {
    console.log('🔍 Starting debug for company 05254058');
    
    try {
        // Extract financial data for company 05254058
        const financialData = await FinanceParser.extractFinancialData('05254058');
        
        console.log('📊 Raw financial data:', financialData);
        
        if (financialData && financialData.historicalData) {
            console.log('📊 Historical data entries:', financialData.historicalData.length);
            
            // Find 2020 data
            const data2020 = financialData.historicalData.find(d => d.year === '2020');
            if (data2020) {
                console.log('📊 2020 Filing Data:');
                console.log('  Date:', data2020.date);
                console.log('  Description:', data2020.description);
                console.log('  Type:', data2020.type);
                console.log('  Metrics:', data2020.metrics);
                
                // Show values compared to Endole
                console.log('📊 2020 VALUES COMPARISON:');
                console.log('  Our Net Assets:', data2020.metrics.netAssets?.value || 'N/A');
                console.log('  Our Total Assets:', data2020.metrics.totalAssets?.value || 'N/A');
                console.log('  Our Total Liabilities:', data2020.metrics.totalLiabilities?.value || 'N/A');
                console.log('  Endole Net Assets: £108,681');
                console.log('  Endole Total Assets: £151,488');
                console.log('  Endole Total Liabilities: £42,807');
                
                // Show all available metrics
                console.log('📊 All metrics found:', Object.keys(data2020.metrics));
                
                // Check for specific XBRL tags
                console.log('📊 Raw XBRL tags (first 10):', Object.keys(data2020.metrics).slice(0, 10));
            } else {
                console.log('❌ No 2020 data found');
                console.log('📊 Available years:', financialData.historicalData.map(d => d.year));
            }
        } else {
            console.log('❌ No financial data found');
        }
    } catch (error) {
        console.error('❌ Error debugging company 05254058:', error);
    }
}

// Run the debug function
debugCompany05254058();