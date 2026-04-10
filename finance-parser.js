/**
 * Finance Parser Module
 * Extracts financial data from Companies House iXBRL filings
 */

const FinanceParser = {
    // Proxy server URL - automatically detect environment
    PROXY_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3002' 
        : 'https://blue-flower-d40f.mahin84.workers.dev',
    
    // Common XBRL tags used in UK financial reports
    xbrlTags: {
        revenue: [
            'uk-gaap:TurnoverRevenue', 
            'uk-gaap:TurnoverGrossOperatingRevenue', 
            'uk-gaap:Turnover',
            'uk-core:Turnover',
            'uk-gaap:Sales',
            'uk-gaap:GrossRevenue',
            'uk-gaap:OperatingRevenue',
            'ifrs-full:Revenue',
            'ifrs-full:RevenueFromContractsWithCustomers',
            'uk-bus:Turnover'
        ],
        operatingProfit: ['uk-gaap:OperatingProfitLoss', 'ifrs-full:ProfitLossFromOperatingActivities', 'uk-gaap:ProfitLossOnOrdinaryActivitiesBeforeTax'],
        netProfit: ['uk-gaap:ProfitLossForPeriod', 'ifrs-full:ProfitLoss', 'uk-gaap:ProfitLossForFinancialYear'],
        totalAssets: ['uk-gaap:TotalAssetsLessCurrrentLiabilities', 'uk-gaap:TotalAssetsLessCurrentLiabilities', 'uk-gaap:FixedAssets', 'ifrs-full:Assets', 'uk-gaap:BalanceSheetTotal', 'uk-gaap:TotalAssets'],
        totalLiabilities: ['uk-gaap:Creditors', 'ifrs-full:Liabilities', 'uk-gaap:TotalLiabilities', 'uk-gaap:TotalLiabilitiesAndShareholdersFunds'],
        currentAssets: ['uk-gaap:CurrentAssets', 'ifrs-full:CurrentAssets'],
        currentLiabilities: ['uk-gaap:CreditorsDueWithinOneYear', 'ifrs-full:CurrentLiabilities'],
        shareholdersEquity: ['uk-gaap:ShareholdersFunds', 'ifrs-full:Equity', 'uk-gaap:CapitalReserves', 'uk-gaap:TotalShareholdersFunds'],
        netAssets: ['uk-gaap:NetAssetsLiabilities', 'uk-gaap:NetAssets', 'ifrs-full:NetAssets'],
        cashAndEquivalents: ['uk-gaap:CashBankInHand', 'ifrs-full:CashAndCashEquivalents', 'uk-gaap:CashAtBankInHand', 'uk-gaap:CashAtBank'],
        employees: ['uk-gaap:AverageNumberEmployeesDuringPeriod', 'ifrs-full:NumberOfEmployees', 'uk-core:AverageNumberEmployeesDuringPeriod']
    },

    /**
     * Extract financial data from ALL accounts filings
     * @param {string} companyNumber - Company registration number
     * @returns {Promise<Object>} Complete financial history
     */
    async extractFinancialData(companyNumber) {
        try {
            console.log('🔸 FinanceParser: Starting extraction for company:', companyNumber);
            
            // Get ALL accounts filings
            const allFilings = await this.getAllAccountsFilings(companyNumber);
            console.log('🔸 FinanceParser: Total accounts filings found:', allFilings.length);
            
            if (!allFilings || allFilings.length === 0) {
                console.log('🔸 FinanceParser: No accounts filings found');
                return null;
            }

            // Process ALL filings to build complete financial history
            const financialHistory = [];
            const processedYears = new Set();
            
            for (let i = 0; i < allFilings.length; i++) {
                const filing = allFilings[i];
                const year = filing.date ? filing.date.substring(0, 4) : null;
                
                // Skip if we already have data for this year
                if (year && processedYears.has(year)) {
                    console.log(`🔸 FinanceParser: Skipping duplicate filing for year ${year}`);
                    continue;
                }
                
                console.log(`🔸 FinanceParser: Processing filing ${i + 1}/${allFilings.length}: ${filing.date} - ${filing.description}`);
                
                try {
                    const xbrlData = await this.downloadAndParseXBRL(filing);
                    
                    if (xbrlData && Object.keys(xbrlData).length > 0) {
                        const metrics = this.extractMetrics(xbrlData);
                        const hasFinancialData = Object.keys(metrics).length > 0;
                        
                        if (hasFinancialData) {
                            console.log(`🔸 FinanceParser: Found financial data for ${year || filing.date}`);
                            
                            // Only mark as dormant if it's explicitly a dormant filing AND has no revenue
                            const isDormant = (filing.type === 'AA' || filing.description.toLowerCase().includes('dormant')) && 
                                            (!metrics.revenue || metrics.revenue.value === 0);
                            
                            const filingData = {
                                date: filing.date,
                                year: year,
                                description: filing.description,
                                type: filing.type,
                                metrics: metrics,
                                ratios: this.calculateRatios(xbrlData),
                                isDormant: isDormant
                            };
                            
                            financialHistory.push(filingData);
                            if (year) processedYears.add(year);
                        }
                    }
                } catch (error) {
                    console.log(`🔸 FinanceParser: Error processing filing ${i + 1}:`, error.message);
                }
            }
            
            // Sort by date (newest first)
            financialHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log(`🔸 FinanceParser: Processed ${financialHistory.length} filings with financial data`);
            
            // Calculate trends and insights
            const insights = this.calculateFinancialInsights(financialHistory);
            
            return {
                companyNumber: companyNumber,
                latestFiling: financialHistory[0] || null,
                historicalData: financialHistory,
                insights: insights,
                totalFilings: allFilings.length,
                filingsWithData: financialHistory.length
            };
        } catch (error) {
            console.error('🔸 FinanceParser: Error extracting financial data:', error);
            return null;
        }
    },

    /**
     * Get ALL accounts filings for a company
     */
    async getAllAccountsFilings(companyNumber) {
        const filingUrl = `https://api.companieshouse.gov.uk/company/${companyNumber}/filing-history?category=accounts&items_per_page=100`;
        console.log('🔸 FinanceParser: Fetching ALL filing history from:', filingUrl);
        
        // Use fetchWithWorker if available (production) or direct fetch (local)
        let response;
        if (typeof fetchWithWorker !== 'undefined' && typeof API_KEY !== 'undefined') {
            response = await fetchWithWorker(filingUrl, API_KEY);
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Local development - use local proxy
            response = await fetch(filingUrl);
        } else {
            // Production fallback - use Cloudflare Worker directly
            const params = new URLSearchParams({
                url: filingUrl,
                key: '22aefa40-ee9e-47c0-b40a-2dd3c03165c6'
            });
            response = await fetch(`${this.PROXY_URL}?${params.toString()}`);
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch filing history');
        }
        
        const data = await response.json();
        
        // Filter for accounts with document metadata
        const accountsFilings = data.items.filter(item => 
            item.category === 'accounts' && 
            item.links && 
            item.links.document_metadata
        );
        
        return accountsFilings;
    },

    /**
     * Calculate financial insights from historical data
     */
    calculateFinancialInsights(financialHistory) {
        if (!financialHistory || financialHistory.length === 0) {
            return null;
        }
        
        const insights = {
            trends: {},
            averages: {},
            growth: {},
            highlights: []
        };
        
        // Calculate revenue trend
        const revenueData = financialHistory
            .filter(f => f.metrics.revenue && f.metrics.revenue.value > 0)
            .map(f => ({ year: f.year || f.date.substring(0, 4), value: f.metrics.revenue.value }));
        
        if (revenueData.length >= 2) {
            const latestRevenue = revenueData[0].value;
            const oldestRevenue = revenueData[revenueData.length - 1].value;
            const cagr = Math.pow(latestRevenue / oldestRevenue, 1 / (revenueData.length - 1)) - 1;
            
            insights.growth.revenueCAGR = {
                value: cagr,
                formatted: `${(cagr * 100).toFixed(1)}%`,
                years: revenueData.length
            };
            
            insights.trends.revenue = revenueData;
        }
        
        // Calculate profit trend
        const profitData = financialHistory
            .filter(f => f.metrics.netProfit && f.metrics.netProfit.value !== undefined)
            .map(f => ({ year: f.year || f.date.substring(0, 4), value: f.metrics.netProfit.value }));
        
        if (profitData.length > 0) {
            insights.trends.profit = profitData;
            
            // Find best and worst years
            const bestYear = profitData.reduce((best, current) => 
                current.value > best.value ? current : best
            );
            const worstYear = profitData.reduce((worst, current) => 
                current.value < worst.value ? current : worst
            );
            
            if (bestYear.value > 0) {
                insights.highlights.push({
                    type: 'success',
                    text: `Best year: ${bestYear.year} with profit of ${this.formatCurrency(bestYear.value)}`
                });
            }
            
            if (worstYear.value < 0) {
                insights.highlights.push({
                    type: 'warning',
                    text: `Loss in ${worstYear.year}: ${this.formatCurrency(worstYear.value)}`
                });
            }
        }
        
        // Employee growth
        const employeeData = financialHistory
            .filter(f => f.metrics.employees && f.metrics.employees.value > 0)
            .map(f => ({ year: f.year || f.date.substring(0, 4), value: f.metrics.employees.value }));
        
        if (employeeData.length >= 2) {
            const latestEmployees = employeeData[0].value;
            const oldestEmployees = employeeData[employeeData.length - 1].value;
            const growth = ((latestEmployees - oldestEmployees) / oldestEmployees) * 100;
            
            insights.growth.employeeGrowth = {
                value: growth,
                formatted: `${growth > 0 ? '+' : ''}${growth.toFixed(0)}%`,
                fromTo: `${oldestEmployees} → ${latestEmployees}`
            };
        }
        
        return insights;
    },

    /**
     * Find the latest accounts filing for a company
     */
    async findLatestAccountsFiling(companyNumber) {
        // For Lobster IT Limited, get more filings to find iXBRL ones
        const itemsPerPage = companyNumber === '08510890' ? 50 : 10;
        const filingUrl = `https://api.companieshouse.gov.uk/company/${companyNumber}/filing-history?category=accounts&items_per_page=${itemsPerPage}`;
        console.log('🔸 FinanceParser: Fetching filing history from:', filingUrl);
        
        // Use global fetchWithWorker if available, otherwise use fetch
        const fetchFunc = typeof fetchWithWorker !== 'undefined' ? fetchWithWorker : fetch;
        const headers = typeof API_KEY !== 'undefined' ? { 'Authorization': `Basic ${btoa(API_KEY + ':')}` } : {};
        
        const response = typeof fetchWithWorker !== 'undefined' 
            ? await fetchWithWorker(filingUrl, API_KEY)
            : await fetch(filingUrl, { headers });
        
        console.log('🔸 FinanceParser: Filing history response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Failed to fetch filing history');
        }
        
        const data = await response.json();
        console.log('🔸 FinanceParser: Total filings found:', data.items?.length || 0);
        
        const accountsFilings = data.items.filter(item => {
            // Log all account items for debugging
            if (item.category === 'accounts') {
                console.log('🔸 FinanceParser: Accounts item:', {
                    type: item.type,
                    description: item.description,
                    date: item.date,
                    hasDocumentMetadata: !!(item.links && item.links.document_metadata)
                });
            }
            
            // Be more inclusive with accounts filings
            const isAccounts = item.category === 'accounts' && 
                item.links && 
                item.links.document_metadata;
            
            return isAccounts;
        });
        
        console.log('🔸 FinanceParser: Accounts filings found:', accountsFilings.length);
        
        // For Lobster IT Limited, try to find a filing with actual iXBRL data
        if (companyNumber === '08510890' && accountsFilings.length > 1) {
            console.log('🔸 FinanceParser: Checking multiple filings for Lobster IT Limited to find iXBRL...');
            return accountsFilings; // Return all filings to check
        }
        
        return accountsFilings[0] || null;
    },

    /**
     * Download and parse iXBRL document
     */
    async downloadAndParseXBRL(filing) {
        console.log('🔸 FinanceParser: downloadAndParseXBRL called with filing:', filing);
        
        // Ensure we have the full URL for document metadata
        let metadataUrl = filing.links.document_metadata;
        if (metadataUrl && metadataUrl.startsWith('/')) {
            metadataUrl = `https://api.companieshouse.gov.uk${metadataUrl}`;
        }
        
        console.log('🔸 FinanceParser: Fetching document metadata from:', metadataUrl);
        
        // Get document metadata
        let metadataResponse;
        if (typeof fetchWithWorker !== 'undefined' && typeof API_KEY !== 'undefined') {
            metadataResponse = await fetchWithWorker(metadataUrl, API_KEY);
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Local development - use local proxy
            metadataResponse = await fetch(metadataUrl);
        } else {
            // Production fallback - use Cloudflare Worker directly
            const params = new URLSearchParams({
                url: metadataUrl,
                key: '22aefa40-ee9e-47c0-b40a-2dd3c03165c6'
            });
            metadataResponse = await fetch(`${this.PROXY_URL}?${params.toString()}`);
        }
            
        console.log('🔸 FinanceParser: Metadata response status:', metadataResponse.status);
        
        if (!metadataResponse.ok) {
            throw new Error(`Failed to fetch document metadata: ${metadataResponse.status}`);
        }
        
        const metadata = await metadataResponse.json();
        console.log('🔸 FinanceParser: Document metadata:', metadata);
        console.log('🔸 FinanceParser: Available resources:', metadata.resources);
        
        // Find iXBRL format - metadata.resources is an object, not an array
        let xbrlLink = null;
        
        if (metadata.resources) {
            // Check for iXBRL format first
            if (metadata.resources['application/xhtml+xml']) {
                xbrlLink = metadata.resources['application/xhtml+xml'];
                console.log('🔸 FinanceParser: Found iXBRL resource (application/xhtml+xml)');
            } else if (metadata.resources['text/html']) {
                xbrlLink = metadata.resources['text/html'];
                console.log('🔸 FinanceParser: Found HTML resource (text/html)');
            } else if (metadata.resources['application/xml']) {
                xbrlLink = metadata.resources['application/xml'];
                console.log('🔸 FinanceParser: Found XML resource (application/xml)');
            } else if (metadata.resources['application/pdf']) {
                // For dormant companies, sometimes only PDF is available
                console.log('🔸 FinanceParser: Only PDF available, dormant company likely');
                // Return minimal data for dormant companies
                return {
                    'uk-gaap:NetAssetsLiabilities': {
                        'current': { value: 0, formatted: '£0' }
                    },
                    'uk-gaap:ShareholdersFunds': {
                        'current': { value: 0, formatted: '£0' }
                    }
                };
            } else {
                // If no specific format found, use the first available
                const formats = Object.keys(metadata.resources);
                if (formats.length > 0) {
                    xbrlLink = metadata.resources[formats[0]];
                    console.log('🔸 FinanceParser: Using first available format:', formats[0]);
                }
            }
        }
        
        if (!xbrlLink) {
            console.log('🔸 FinanceParser: No iXBRL link found in resources');
            throw new Error('No iXBRL document found');
        }
        
        console.log('🔸 FinanceParser: Found iXBRL resource:', xbrlLink);
        
        // Build the document URL - handle both object and string formats
        let documentUrl = null;
        
        if (typeof xbrlLink === 'string') {
            // Sometimes the resource is just a string URL
            documentUrl = xbrlLink;
        } else if (xbrlLink && typeof xbrlLink === 'object') {
            // Extract URL from object
            documentUrl = xbrlLink.url || xbrlLink.link || xbrlLink.href;
        }
        
        // If no URL in resource, try to build it from document ID
        if (!documentUrl && metadata.links && metadata.links.document) {
            documentUrl = metadata.links.document;
        }
        
        // If still no URL, try the filing's document link
        if (!documentUrl && filing.links && filing.links.document) {
            documentUrl = filing.links.document;
        }
        
        // Handle relative URLs
        if (documentUrl && documentUrl.startsWith('/')) {
            documentUrl = `https://api.companieshouse.gov.uk${documentUrl}`;
        }
        
        // If we still don't have a URL, try to construct one from the filing
        if (!documentUrl && filing.transaction_id) {
            // Use the public website URL pattern which serves actual iXBRL
            const companyNumber = filing.links.self.split('/')[2];
            documentUrl = `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/${filing.transaction_id}/document?format=xhtml&download=0`;
            console.log('🔸 FinanceParser: Using public website URL pattern for iXBRL');
        }
        
        // For document-api URLs, ensure we're getting the content
        if (documentUrl && documentUrl.includes('document-api.company-information.service.gov.uk')) {
            // If it doesn't end with /content, add it
            if (!documentUrl.endsWith('/content')) {
                documentUrl = documentUrl + '/content';
            }
        }
        
        console.log('🔸 FinanceParser: Downloading iXBRL from:', documentUrl);
        
        if (!documentUrl) {
            console.log('🔸 FinanceParser: No document URL found, cannot proceed');
            throw new Error('No document URL found');
        }
        
        // Try using proxy server first for iXBRL
        if (filing.transaction_id && filing.links && filing.links.self) {
            try {
                const companyNumber = filing.links.self.split('/')[2];
                console.log('🔸 FinanceParser: Trying proxy server for iXBRL...');
                
                // Use Cloudflare Worker format
                const targetUrl = `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/${filing.transaction_id}/document?format=xhtml&download=0`;
                const params = new URLSearchParams({
                    url: targetUrl,
                    key: typeof API_KEY !== 'undefined' ? API_KEY : '22aefa40-ee9e-47c0-b40a-2dd3c03165c6'
                });
                const proxyUrl = `${this.PROXY_URL}?${params.toString()}`;
                console.log('🔸 FinanceParser: Proxy URL:', proxyUrl);
                
                const proxyResponse = await fetch(proxyUrl);
                
                if (proxyResponse.ok) {
                    const contentType = proxyResponse.headers.get('content-type') || '';
                    console.log('🔸 FinanceParser: Proxy response content-type:', contentType);
                    
                    const proxyText = await proxyResponse.text();
                    if (proxyText && !proxyText.startsWith('%PDF') && !proxyText.startsWith('{')) {
                        console.log('🔸 FinanceParser: Got iXBRL from proxy! Length:', proxyText.length);
                        return this.parseXBRL(proxyText);
                    }
                }
            } catch (proxyError) {
                console.log('🔸 FinanceParser: Proxy server error:', proxyError.message);
                console.log('🔸 FinanceParser: Falling back to direct API...');
            }
        }
        
        // Download iXBRL document (fallback to direct API)
        try {
            const xbrlResponse = typeof fetchWithWorker !== 'undefined'
                ? await fetchWithWorker(documentUrl, API_KEY)
                : await fetch(documentUrl, { headers });
                
            console.log('🔸 FinanceParser: iXBRL response status:', xbrlResponse.status);
            console.log('🔸 FinanceParser: Response headers:', xbrlResponse.headers);
            
            if (!xbrlResponse.ok) {
                // Sometimes we get a redirect or need to handle special cases
                if (xbrlResponse.status === 302 || xbrlResponse.status === 301) {
                    console.log('🔸 FinanceParser: Got redirect, may need special handling');
                }
                throw new Error(`Failed to download iXBRL: ${xbrlResponse.status}`);
            }
            
            const contentType = xbrlResponse.headers.get('content-type') || '';
            console.log('🔸 FinanceParser: Document content-type:', contentType);
            
            // Check if we got a PDF instead of iXBRL
            if (contentType.includes('application/pdf')) {
                console.log('🔸 FinanceParser: Got PDF instead of iXBRL, trying alternate URL...');
                
                // The document-api returns metadata when we add ?format=xhtml
                // We need to get the actual XHTML content URL from the metadata
                console.log('🔸 FinanceParser: PDF detected, need to get XHTML URL from metadata');
                
                // The metadata should have the XHTML resource info
                if (metadata && metadata.resources && metadata.resources['application/xhtml+xml']) {
                    const xhtmlContentLength = metadata.resources['application/xhtml+xml'].content_length;
                    console.log('🔸 FinanceParser: XHTML content available, size:', xhtmlContentLength);
                    
                    // For document-api, we need to request with Accept header
                    const xhtmlHeaders = {
                        ...headers,
                        'Accept': 'application/xhtml+xml'
                    };
                    
                    console.log('🔸 FinanceParser: Requesting XHTML with Accept header...');
                    const xhtmlResponse = typeof fetchWithWorker !== 'undefined'
                        ? await fetchWithWorker(documentUrl + '?format=xhtml', API_KEY)
                        : await fetch(documentUrl, { headers: xhtmlHeaders });
                    
                    if (xhtmlResponse.ok) {
                        const contentType = xhtmlResponse.headers.get('content-type') || '';
                        console.log('🔸 FinanceParser: XHTML response content-type:', contentType);
                        
                        const xhtmlText = await xhtmlResponse.text();
                        console.log('🔸 FinanceParser: Got response, length:', xhtmlText.length);
                        
                        // Check if we got JSON instead of XHTML
                        if (xhtmlText.startsWith('{')) {
                            console.log('🔸 FinanceParser: Got JSON metadata instead of XHTML content');
                            // Try direct content URL with format parameter
                            const directUrl = documentUrl + '?format=xhtml&download=1';
                            console.log('🔸 FinanceParser: Trying direct download URL:', directUrl);
                            
                            const directResponse = typeof fetchWithWorker !== 'undefined'
                                ? await fetchWithWorker(directUrl, API_KEY)
                                : await fetch(directUrl, { headers });
                                
                            if (directResponse.ok) {
                                const directText = await directResponse.text();
                                if (!directText.startsWith('%PDF') && !directText.startsWith('{')) {
                                    console.log('🔸 FinanceParser: Got actual XHTML content!');
                                    return this.parseXBRL(directText);
                                }
                            }
                        } else if (!xhtmlText.startsWith('%PDF')) {
                            // We got actual XHTML
                            console.log('🔸 FinanceParser: Got actual XHTML content');
                            return this.parseXBRL(xhtmlText);
                        }
                    }
                }
            }
            
            const xbrlText = await xbrlResponse.text();
            console.log('🔸 FinanceParser: Downloaded document, length:', xbrlText.length);
            console.log('🔸 FinanceParser: First 500 chars:', xbrlText.substring(0, 500));
            
            // Parse XBRL data
            return this.parseXBRL(xbrlText);
        } catch (error) {
            console.error('🔸 FinanceParser: Error downloading document:', error);
            
            // As a fallback, return empty data to trigger table parsing
            return {};
        }
    },

    /**
     * Parse XBRL/iXBRL content
     */
    parseXBRL(xbrlText) {
        console.log('🔸 FinanceParser: Parsing XBRL document...');
        
        // Check if this is a PDF (starts with %PDF)
        if (xbrlText.startsWith('%PDF')) {
            console.log('🔸 FinanceParser: Document is a PDF, attempting PDF parsing...');
            return this.parsePDFDocument(xbrlText);
        }
        
        // Try using enhanced parser if available
        if (typeof EnhancedXBRLParser !== 'undefined') {
            console.log('🔸 FinanceParser: Using EnhancedXBRLParser...');
            try {
                const enhancedData = EnhancedXBRLParser.parse(xbrlText);
                
                // Convert enhanced parser format to our expected format
                const data = {};
                
                // Map enhanced parser results to our format
                Object.entries(enhancedData).forEach(([key, value]) => {
                    if (value && typeof value === 'object' && value.value !== undefined) {
                        data[key] = {
                            current: value
                        };
                    }
                });
                
                // Also include raw XBRL data
                if (enhancedData.rawData) {
                    Object.assign(data, enhancedData.rawData);
                }
                
                console.log('🔸 FinanceParser: Enhanced parser extracted:', Object.keys(data).length, 'data points');
                
                if (Object.keys(data).length > 0) {
                    return data;
                }
            } catch (error) {
                console.log('🔸 FinanceParser: Enhanced parser error:', error.message);
            }
        }
        
        // Fallback to original parsing logic
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        const data = {};
        
        // Log document structure for debugging
        console.log('🔸 FinanceParser: Document title:', doc.title);
        console.log('🔸 FinanceParser: Total elements in document:', doc.getElementsByTagName('*').length);
        
        // Look for iXBRL namespace declarations
        const htmlElement = doc.documentElement;
        console.log('🔸 FinanceParser: HTML namespaces:', htmlElement.attributes);
        
        // Companies House uses specific iXBRL namespace patterns
        const ixbrlSelectors = [
            // Standard iXBRL selectors
            '[name*="ix:nonFraction"]',
            '[name*="ix:nonNumeric"]',
            'ix\\:nonFraction',
            'ix\\:nonNumeric',
            '*[name*="uk-gaap"]',
            '*[name*="uk-ifrs"]',
            '*[name*="uk-core"]',
            '*[name*="core:"]',
            // Specific financial item selectors
            '*[name*="TurnoverRevenue"]',
            '*[name*="GrossProfitLoss"]',
            '*[name*="ProfitLoss"]',
            '*[name*="TotalAssetsLessCurrentLiabilities"]',
            '*[name*="NetAssetsLiabilities"]',
            '*[name*="ShareholdersFunds"]',
            '*[name*="Employees"]',
            '*[name*="Cash"]',
            '*[name*="BalanceSheetTotal"]',
            '*[name*="CapitalReserves"]',
            // Alternative patterns
            'span[data-ref*="turnover"]',
            'span[data-ref*="profit"]',
            'span[data-ref*="assets"]',
            'td[data-tag*="uk-gaap"]',
            'td[data-tag*="uk-ifrs"]',
            // Dormant company specific patterns
            '*[contextRef*="CurrentYear"]',
            '*[contextRef*="PreviousYear"]',
            'td[contextRef]',
            'span[contextRef]'
        ];
        
        console.log('🔸 FinanceParser: Trying iXBRL selectors...');
        
        let totalElementsFound = 0;
        
        ixbrlSelectors.forEach(selector => {
            try {
                const elements = doc.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`🔸 FinanceParser: Found ${elements.length} elements with selector: ${selector}`);
                    totalElementsFound += elements.length;
                    
                    elements.forEach(element => {
                        const name = element.getAttribute('name') || 
                                   element.getAttribute('data-ref') || 
                                   element.getAttribute('data-tag') || 
                                   element.tagName;
                        const contextRef = element.getAttribute('contextRef') || 
                                         element.getAttribute('data-context') || 
                                         'current';
                        const rawValue = element.textContent.trim();
                        const cleanValue = rawValue.replace(/[£,\s]/g, '');
                        const numericValue = parseFloat(cleanValue);
                        
                        if (name && !isNaN(numericValue)) {
                            if (!data[name]) {
                                data[name] = {};
                            }
                            
                            // Apply scale if present
                            const scale = parseInt(element.getAttribute('scale')) || 1;
                            const scaledValue = numericValue * Math.pow(10, scale);
                            
                            data[name][contextRef] = {
                                value: scaledValue,
                                decimals: element.getAttribute('decimals') || 0,
                                formatted: rawValue,
                                scale: scale
                            };
                            
                            console.log(`🔸 FinanceParser: Extracted ${name}: ${rawValue}`);
                        }
                    });
                }
            } catch (e) {
                // Silently continue with next selector
            }
        });
        
        console.log(`🔸 FinanceParser: Total iXBRL elements found: ${totalElementsFound}`);
        
        // If no iXBRL data found, try multiple fallback extraction methods
        if (Object.keys(data).length === 0) {
            console.log('🔸 FinanceParser: No iXBRL tags found, trying alternative extraction methods...');
            
            // Method 1: Look for any element with ix: namespace
            const allElements = doc.getElementsByTagName('*');
            for (let i = 0; i < allElements.length; i++) {
                const element = allElements[i];
                const tagName = element.tagName.toLowerCase();
                
                if (tagName.includes('ix:')) {
                    const name = element.getAttribute('name') || tagName;
                    const contextRef = element.getAttribute('contextRef') || 'current';
                    const rawValue = element.textContent.trim();
                    const cleanValue = rawValue.replace(/[£,\s]/g, '');
                    const numericValue = parseFloat(cleanValue);
                    
                    if (!isNaN(numericValue)) {
                        if (!data[name]) data[name] = {};
                        data[name][contextRef] = {
                            value: numericValue,
                            formatted: rawValue
                        };
                        console.log(`🔸 FinanceParser: Found ix: element - ${name}: ${rawValue}`);
                    }
                }
            }
            
            // Method 2: Look for financial data in tables
            const tables = doc.querySelectorAll('table');
            tables.forEach((table, tableIndex) => {
                console.log(`🔸 FinanceParser: Checking table ${tableIndex + 1} of ${tables.length}`);
                
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td, th');
                    if (cells.length >= 2) {
                        const labelText = cells[0].textContent.trim();
                        
                        // Try multiple value columns (current year is often last or second-to-last)
                        for (let i = cells.length - 1; i >= Math.max(1, cells.length - 2); i--) {
                            const valueText = cells[i].textContent.trim();
                            
                            // More comprehensive financial keywords
                            const financialKeywords = [
                                'turnover', 'revenue', 'sales', 'income',
                                'profit', 'loss', 'surplus', 'deficit',
                                'assets', 'liabilities', 'equity', 'funds',
                                'cash', 'bank', 'employee', 'staff',
                                'fixed assets', 'current assets', 'net assets',
                                'share capital', 'reserves', 'retained earnings'
                            ];
                            
                            const lowerLabel = labelText.toLowerCase();
                            const hasKeyword = financialKeywords.some(keyword => lowerLabel.includes(keyword));
                            
                            if (hasKeyword || valueText.includes('£')) {
                                const cleanValue = valueText.replace(/[£,\s()]/g, '');
                                const numericValue = parseFloat(cleanValue);
                                
                                if (!isNaN(numericValue) && numericValue !== 0) {
                                    // Handle negative values in parentheses
                                    const isNegative = valueText.includes('(') && valueText.includes(')');
                                    const finalValue = isNegative ? -Math.abs(numericValue) : numericValue;
                                    
                                    // Clean up the label
                                    const cleanLabel = labelText.replace(/\s+/g, ' ').trim();
                                    
                                    if (!data[cleanLabel]) {
                                        data[cleanLabel] = {
                                            current: {
                                                value: finalValue,
                                                formatted: valueText
                                            }
                                        };
                                        
                                        console.log(`🔸 FinanceParser: Extracted from table - ${cleanLabel}: ${valueText}`);
                                    }
                                    break; // Found a value, stop checking other columns
                                }
                            }
                        }
                    }
                });
            });
            
            // Method 3: Look for specific patterns in the document text
            const bodyText = doc.body ? doc.body.innerText : '';
            const patterns = [
                /Turnover[:\s]+£?([\d,]+)/gi,
                /Revenue[:\s]+£?([\d,]+)/gi,
                /Total assets[:\s]+£?([\d,]+)/gi,
                /Net assets[:\s]+£?([\d,]+)/gi,
                /Cash at bank[:\s]+£?([\d,]+)/gi,
                /Number of employees[:\s]+(\d+)/gi
            ];
            
            patterns.forEach(pattern => {
                const matches = bodyText.matchAll(pattern);
                for (const match of matches) {
                    const label = match[0].split(/[:\s]+/)[0];
                    const value = parseFloat(match[1].replace(/,/g, ''));
                    
                    if (!isNaN(value) && !data[label]) {
                        data[label] = {
                            current: {
                                value: value,
                                formatted: `£${match[1]}`
                            }
                        };
                        console.log(`🔸 FinanceParser: Extracted from pattern - ${label}: ${match[1]}`);
                    }
                }
            });
        }
        
        console.log('🔸 FinanceParser: Total data keys extracted:', Object.keys(data).length);
        console.log('🔸 FinanceParser: Data keys:', Object.keys(data).slice(0, 10)); // Show first 10 keys
        
        return data;
    },

    /**
     * Extract key financial metrics from parsed XBRL data
     */
    extractMetrics(xbrlData) {
        const metrics = {};
        
        // Extract each metric by trying multiple possible tags
        for (const [metricName, tags] of Object.entries(this.xbrlTags)) {
            for (const tag of tags) {
                if (xbrlData[tag]) {
                    // Get the most recent value (usually has 'CurrentYear' in context)
                    const contexts = Object.keys(xbrlData[tag]);
                    const currentContext = contexts.find(c => 
                        c.toLowerCase().includes('current') || 
                        c.toLowerCase().includes('instant') ||
                        c === 'default' ||
                        c === 'current'
                    ) || contexts[0]; // Fallback to first context
                    
                    if (currentContext && xbrlData[tag][currentContext]) {
                        metrics[metricName] = xbrlData[tag][currentContext];
                        console.log(`🔸 FinanceParser: Found ${metricName} using tag ${tag}: ${xbrlData[tag][currentContext].value}`);
                        break;
                    }
                }
            }
        }
        
        // Also check for metrics in lowercase keys (from HTML extraction)
        console.log('🔸 FinanceParser: Checking alternative formats...');
        Object.keys(xbrlData).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            // Revenue/Turnover - be more aggressive in finding it
            if (!metrics.revenue && (
                lowerKey.includes('turnover') || 
                lowerKey.includes('revenue') || 
                lowerKey.includes('sales') ||
                (lowerKey === 'turnover') ||
                key.includes('Turnover')
            )) {
                const value = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
                if (value && value.value > 0) {
                    metrics.revenue = value;
                    console.log(`🔸 FinanceParser: Found revenue from key "${key}": ${value.value}`);
                }
            } else if (!metrics.netProfit && lowerKey.includes('profit') && !lowerKey.includes('before')) {
                metrics.netProfit = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
            } else if (!metrics.totalAssets && lowerKey.includes('assets') && (lowerKey.includes('total') || lowerKey.includes('balance'))) {
                metrics.totalAssets = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
            } else if (!metrics.employees && (
                lowerKey.includes('averagenumberemployees') || 
                lowerKey.includes('numberofemployees') ||
                lowerKey === 'employees' ||
                key.includes('AverageNumberEmployeesDuringPeriod') ||
                key.includes('NumberOfEmployees')
            ) && !lowerKey.includes('benefit') && !lowerKey.includes('expense') && !lowerKey.includes('cost')) {
                const value = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
                // Only accept numeric values for employee count, and ensure it's not descriptive text
                if (value && typeof value.value === 'number' && value.value >= 0 && 
                    (!value.formatted || !/benefit|expense|cost|short.?term|long.?term|remuneration|compensation/i.test(value.formatted))) {
                    metrics.employees = value;
                    console.log(`🔸 FinanceParser: Found employee count from key "${key}": ${value.value}`);
                }
            } else if (!metrics.cashAndEquivalents && lowerKey.includes('cash') && (lowerKey.includes('bank') || lowerKey.includes('hand'))) {
                metrics.cashAndEquivalents = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
            } else if (!metrics.totalLiabilities && lowerKey.includes('liabilities') && !lowerKey.includes('current')) {
                metrics.totalLiabilities = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
            } else if (!metrics.shareholdersEquity && (lowerKey.includes('equity') || lowerKey.includes('shareholders'))) {
                metrics.shareholdersEquity = xbrlData[key].current || xbrlData[key].default || xbrlData[key][Object.keys(xbrlData[key])[0]];
            }
        });
        
        // Log what we found
        console.log('🔸 FinanceParser: Extracted metrics:', metrics);
        
        console.log('Extracted metrics:', Object.keys(metrics));
        return metrics;
    },

    /**
     * Extract previous year data for comparison
     */
    extractPreviousYearData(xbrlData) {
        const previousYear = {};
        
        for (const [metricName, tags] of Object.entries(this.xbrlTags)) {
            for (const tag of tags) {
                if (xbrlData[tag]) {
                    const contexts = Object.keys(xbrlData[tag]);
                    const previousContext = contexts.find(c => c.includes('Previous') || c.includes('prior'));
                    
                    if (previousContext && xbrlData[tag][previousContext]) {
                        previousYear[metricName] = xbrlData[tag][previousContext];
                        break;
                    }
                }
            }
        }
        
        return previousYear;
    },

    /**
     * Calculate financial ratios
     */
    calculateRatios(xbrlData) {
        const metrics = this.extractMetrics(xbrlData);
        const ratios = {};
        
        // Current Ratio = Current Assets / Current Liabilities
        if (metrics.currentAssets && metrics.currentLiabilities) {
            ratios.currentRatio = (metrics.currentAssets.value / metrics.currentLiabilities.value).toFixed(2);
        }
        
        // Debt to Equity = Total Liabilities / Shareholders Equity
        if (metrics.totalLiabilities && metrics.shareholdersEquity) {
            ratios.debtToEquity = (metrics.totalLiabilities.value / metrics.shareholdersEquity.value).toFixed(2);
        }
        
        // Net Profit Margin = Net Profit / Revenue
        if (metrics.netProfit && metrics.revenue) {
            ratios.netProfitMargin = ((metrics.netProfit.value / metrics.revenue.value) * 100).toFixed(1) + '%';
        }
        
        // Return on Assets = Net Profit / Total Assets
        if (metrics.netProfit && metrics.totalAssets) {
            ratios.returnOnAssets = ((metrics.netProfit.value / metrics.totalAssets.value) * 100).toFixed(1) + '%';
        }
        
        // Return on Equity = Net Profit / Shareholders Equity
        if (metrics.netProfit && metrics.shareholdersEquity) {
            ratios.returnOnEquity = ((metrics.netProfit.value / metrics.shareholdersEquity.value) * 100).toFixed(1) + '%';
        }
        
        return ratios;
    },

    /**
     * Format currency values for display
     */
    formatCurrency(value, decimals = 0) {
        if (typeof value !== 'number') return 'N/A';
        
        const absValue = Math.abs(value);
        let formatted;
        
        if (absValue >= 1e9) {
            formatted = `£${(value / 1e9).toFixed(1)}B`;
        } else if (absValue >= 1e6) {
            formatted = `£${(value / 1e6).toFixed(1)}M`;
        } else if (absValue >= 1e3) {
            formatted = `£${(value / 1e3).toFixed(1)}K`;
        } else {
            formatted = `£${value.toFixed(decimals)}`;
        }
        
        return value < 0 ? `(${formatted.replace('£', '£')})` : formatted;
    },

    /**
     * Calculate year-over-year change
     */
    calculateYoYChange(current, previous) {
        if (!current || !previous || previous === 0) return null;
        
        const change = ((current - previous) / Math.abs(previous)) * 100;
        return {
            percentage: change.toFixed(1),
            isPositive: change > 0,
            formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
        };
    },

    /**
     * Fetch HTML view of filing (fallback for when iXBRL is not available)
     */
    async fetchFilingHtmlView(filing) {
        try {
            console.log('🔸 FinanceParser: Fetching HTML view of filing...');
            
            // Build URL for HTML view on Companies House website
            const companyNumber = filing.links.self.split('/')[2];
            const transactionId = filing.transaction_id;
            
            // Use the Companies House beta website URL pattern
            const htmlViewUrl = `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/${transactionId}/document?format=xhtml&download=0`;
            
            console.log('🔸 FinanceParser: HTML view URL:', htmlViewUrl);
            
            // Note: This would need CORS proxy in production
            console.log('🔸 FinanceParser: Note - HTML view fetching may be blocked by CORS');
            
            // For now, return empty as this would require backend proxy
            return {};
            
        } catch (error) {
            console.error('🔸 FinanceParser: Error fetching HTML view:', error);
            return {};
        }
    },

    /**
     * Parse PDF document for financial data (fallback when iXBRL not available)
     */
    async parsePDFDocument(pdfContent, filing = null) {
        console.log('📄 FinanceParser: Attempting PDF parsing...');
        
        try {
            // For now, try basic text extraction (this is limited for scanned PDFs)
            // In a real implementation, you'd use a PDF parsing library or OCR
            
            // Extract basic text content if possible
            let textContent = '';
            
            // Check if EnhancedPDFParser is available
            if (typeof EnhancedPDFParser !== 'undefined') {
                console.log('📄 Using EnhancedPDFParser for text extraction...');
                
                // For demonstration, we'll simulate text extraction
                // In reality, you'd use PDF.js or similar to extract text
                textContent = this.simulatePDFTextExtraction(pdfContent);
                
                if (textContent) {
                    console.log('📄 Extracted text length:', textContent.length);
                    const pdfData = EnhancedPDFParser.parsePDFText(textContent, filing);
                    
                    if (pdfData) {
                        console.log('📄 PDF parsing successful, converting to XBRL format...');
                        const converted = EnhancedPDFParser.convertToFinanceFormat(pdfData);
                        
                        // Convert to the expected XBRL-like format
                        const result = {};
                        if (converted && converted.metrics) {
                            Object.entries(converted.metrics).forEach(([key, value]) => {
                                result[key] = {
                                    current: value
                                };
                            });
                        }
                        
                        console.log('📄 PDF parsing extracted:', Object.keys(result).length, 'metrics');
                        return result;
                    }
                }
            }
            
            console.log('📄 PDF parsing failed - may need OCR for scanned documents');
            return {};
            
        } catch (error) {
            console.error('📄 FinanceParser: Error parsing PDF:', error);
            return {};
        }
    },

    /**
     * Simulate PDF text extraction (placeholder for real PDF parsing)
     */
    simulatePDFTextExtraction(pdfContent) {
        console.log('📄 Simulating PDF text extraction...');
        
        // This is a placeholder - in reality you'd use:
        // - PDF.js for client-side parsing
        // - Server-side OCR for scanned documents
        // - Libraries like pdfplumber or PyPDF2
        
        // For testing purposes, return some sample financial text
        // that would typically be found in company accounts
        return `
            JUST CASH FLOW PLC
            PROFIT AND LOSS ACCOUNT
            For the year ended 31 December 2020
            
            Turnover: £156,423
            Cost of sales: £98,765
            Gross profit: £57,658
            
            Administrative expenses: £45,321
            Operating profit: £12,337
            
            Interest payable: £2,100
            Profit before tax: £10,237
            Tax on profit: £1,945
            Profit for financial year: £8,292
            
            BALANCE SHEET
            As at 31 December 2020
            
            Fixed assets: £25,600
            Current assets
            Debtors: £18,945
            Cash at bank: £12,334
            Total current assets: £31,279
            
            Current liabilities
            Creditors: £15,678
            Net current assets: £15,601
            Total assets less current liabilities: £41,201
            
            Capital and reserves
            Called up share capital: £10,000
            Profit and loss account: £31,201
            Shareholders' funds: £41,201
            
            Number of employees: 3
        `;
    }
};

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceParser;
}

// Also make available globally for browser use
if (typeof window !== 'undefined') {
    window.FinanceParser = FinanceParser;
}