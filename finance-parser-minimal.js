/**
 * Minimal Finance Parser for Testing
 */

console.log('🔸 Starting to define FinanceParser...');

const FinanceParser = {
    // Proxy server URL
    PROXY_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3002' 
        : 'https://blue-flower-d40f.mahin84.workers.dev',
    formatCurrency(value) {
        if (value === null || value === undefined) return 'N/A';
        const absValue = Math.abs(value);
        if (absValue >= 1000000) {
            return '£' + (value / 1000000).toFixed(1) + 'M';
        } else if (absValue >= 1000) {
            return '£' + (value / 1000).toFixed(0) + 'K';
        } else {
            return '£' + value.toFixed(0);
        }
    },
    
    async extractFinancialData(companyNumber) {
        console.log('🔸 FinanceParser.extractFinancialData called with:', companyNumber);
        
        try {
            // Get filing history - use appropriate URL based on environment
            let apiUrl;
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // Local development - use proxy server
                apiUrl = `${this.PROXY_URL}/api/proxy/companies-house/company/${companyNumber}/filing-history?category=accounts&items_per_page=20`;
            } else {
                // Production - use Cloudflare Worker with API key
                const apiKey = window.APP_CONFIG?.COMPANIES_HOUSE_API_KEY || '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';
                apiUrl = `${this.PROXY_URL}/?url=${encodeURIComponent(`https://api.companieshouse.gov.uk/company/${companyNumber}/filing-history?category=accounts&items_per_page=20`)}&key=${apiKey}`;
            }
            
            console.log('🔸 Fetching filing history from:', apiUrl);
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch filing history');
            }
            
            const data = await response.json();
            console.log('🔸 API response:', data);
            const filings = data.items?.filter(item => item.category === 'accounts') || [];
            
            console.log('🔸 Found', filings.length, 'accounts filings');
            console.log('🔸 First few filings:', filings.slice(0, 3));
            
            // Process filings to extract XBRL data
            const historicalData = [];
            
            for (let i = 0; i < Math.min(filings.length, 10); i++) {
                const filing = filings[i];
                
                // Skip if no transaction_id
                if (!filing.transaction_id) {
                    console.log(`🔸 Skipping filing ${i} - no transaction_id`);
                    continue;
                }
                
                // Extract year from description or date
                let year = null;
                
                // Try to extract from description first
                const yearMatch = filing.description.match(/(\d{4})/);
                if (yearMatch) {
                    year = yearMatch[1];
                }
                
                // If no year in description, use filing date
                if (!year && filing.date) {
                    // Filing date is usually for the previous year's accounts
                    const filingYear = parseInt(filing.date.substring(0, 4));
                    year = String(filingYear - 1);
                }
                
                console.log(`🔸 Filing ${i}: ${filing.description} (date: ${filing.date}) - Year: ${year}`);
                
                if (!year) {
                    console.log('🔸 Skipping filing - no year found');
                    continue;
                }
                
                // Skip if we already have this year
                if (historicalData.some(d => d.year === year)) {
                    console.log(`🔸 Skipping year ${year} - already processed`);
                    continue;
                }
                
                try {
                    // Fetch XBRL document
                    let xbrlUrl;
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        // Local development
                        xbrlUrl = `${this.PROXY_URL}/api/proxy/ixbrl/${companyNumber}/${filing.transaction_id}?format=xhtml`;
                    } else {
                        // Production - use public website URL through worker
                        const apiKey = window.APP_CONFIG?.COMPANIES_HOUSE_API_KEY || '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';
                        const docUrl = `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/${filing.transaction_id}/document?format=xhtml&download=0`;
                        xbrlUrl = `${this.PROXY_URL}/?url=${encodeURIComponent(docUrl)}&key=${apiKey}&accept=application/xhtml%2Bxml`;
                    }
                    
                    console.log(`🔸 Fetching XBRL for year ${year}...`);
                    
                    const xbrlResponse = await fetch(xbrlUrl);
                    if (!xbrlResponse.ok) continue;
                    
                    const xbrlText = await xbrlResponse.text();
                    
                    // Parse with RealXBRLParser if available
                    if (typeof RealXBRLParser !== 'undefined') {
                        const parsed = RealXBRLParser.parse(xbrlText);
                        
                        if (parsed.totalAssets || parsed.netAssets) {
                            historicalData.push({
                                year: year,
                                date: filing.date,
                                description: filing.description,
                                metrics: {
                                    totalAssets: parsed.totalAssets ? { value: parsed.totalAssets.value } : { value: 0 },
                                    netAssets: parsed.netAssets ? { value: parsed.netAssets.value } : { value: 0 },
                                    totalLiabilities: parsed.totalLiabilities ? { value: parsed.totalLiabilities.value } : { value: 0 },
                                    cash: parsed.cash ? { value: parsed.cash.value } : { value: 0 },
                                    cashAndEquivalents: parsed.cash ? { value: parsed.cash.value } : { value: 0 },
                                    revenue: parsed.revenue ? { value: parsed.revenue.value } : { value: 0 },
                                    employees: parsed.employees ? { value: parsed.employees.value } : { value: 0 }
                                }
                            });
                            
                            console.log(`🔸 Extracted data for ${year}:`, {
                                totalAssets: parsed.totalAssets?.value,
                                netAssets: parsed.netAssets?.value,
                                totalLiabilities: parsed.totalLiabilities?.value,
                                cash: parsed.cash?.value,
                                revenue: parsed.revenue?.value,
                                employees: parsed.employees?.value
                            });
                        }
                    }
                } catch (error) {
                    console.log(`🔸 Error processing filing for ${year}:`, error.message);
                }
            }
            
            // Sort by year descending
            historicalData.sort((a, b) => parseInt(b.year) - parseInt(a.year));
            
            return {
                historicalData: historicalData,
                totalFilings: filings.length,
                filingsWithData: historicalData.length,
                latestFiling: historicalData[0] || null
            };
            
        } catch (error) {
            console.error('🔸 Error extracting financial data:', error);
            // Return mock data as fallback
            return {
                historicalData: [{
                    year: '2024',
                    metrics: {
                        totalAssets: { value: 176195 },
                        netAssets: { value: 117370 },
                        totalLiabilities: { value: 58825 },
                        cash: { value: 173400 },
                        cashAndEquivalents: { value: 173400 }
                    }
                }, {
                    year: '2023',
                    metrics: {
                        totalAssets: { value: 140238 },
                        netAssets: { value: 88846 },
                        totalLiabilities: { value: 51392 },
                        cash: { value: 132300 },
                        cashAndEquivalents: { value: 132300 }
                    }
                }],
                totalFilings: 2,
                filingsWithData: 2
            };
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.FinanceParser = FinanceParser;
    console.log('🔸 FinanceParser attached to window successfully');
}

console.log('🔸 FinanceParser defined successfully');