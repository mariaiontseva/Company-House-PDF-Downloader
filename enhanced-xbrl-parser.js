/**
 * Enhanced XBRL Parser for Companies House iXBRL documents
 * Handles various iXBRL formats and extracts financial data more reliably
 */

const EnhancedXBRLParser = {
    /**
     * Parse iXBRL document and extract all financial data
     */
    parse(xbrlText) {
        console.log('📊 Enhanced Parser: Starting parse...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        // Extract all financial data using multiple methods
        const data = {
            raw: {},
            metrics: {},
            tables: {},
            context: {}
        };
        
        // Method 1: Extract all ix: elements
        this.extractIXBRLElements(doc, data);
        
        // Method 2: Extract from tables
        this.extractFromTables(doc, data);
        
        // Method 3: Extract using specific patterns
        this.extractUsingPatterns(doc, data);
        
        // Method 4: Extract context information
        this.extractContextInfo(doc, data);
        
        // Normalize and structure the data
        const structured = this.structureFinancialData(data);
        
        console.log('📊 Enhanced Parser: Extraction complete');
        return structured;
    },
    
    /**
     * Extract all ix: namespace elements
     */
    extractIXBRLElements(doc, data) {
        console.log('📊 Extracting iXBRL elements...');
        
        // Get all elements in the document
        const allElements = doc.getElementsByTagName('*');
        let ixCount = 0;
        
        for (let i = 0; i < allElements.length; i++) {
            const element = allElements[i];
            
            // Check for ix: namespace elements
            if (element.tagName.toLowerCase().startsWith('ix:')) {
                ixCount++;
                const name = element.getAttribute('name') || element.tagName;
                const contextRef = element.getAttribute('contextRef') || 'default';
                const unitRef = element.getAttribute('unitRef');
                const decimals = element.getAttribute('decimals');
                const scale = element.getAttribute('scale') || '0';
                const format = element.getAttribute('format');
                const value = element.textContent.trim();
                
                // Parse numeric value
                const numericValue = this.parseNumericValue(value, scale);
                
                if (!data.raw[name]) {
                    data.raw[name] = {};
                }
                
                data.raw[name][contextRef] = {
                    value: numericValue,
                    formatted: value,
                    unit: unitRef,
                    decimals: decimals,
                    scale: scale,
                    format: format
                };
                
                console.log(`📊 Found: ${name} = ${value} (context: ${contextRef})`);
            }
            
            // Also check for elements with name attribute containing XBRL tags
            const nameAttr = element.getAttribute('name');
            if (nameAttr && (nameAttr.includes(':') || nameAttr.includes('uk-'))) {
                const contextRef = element.getAttribute('contextRef') || 'default';
                const value = element.textContent.trim();
                const numericValue = this.parseNumericValue(value);
                
                if (!data.raw[nameAttr]) {
                    data.raw[nameAttr] = {};
                }
                
                data.raw[nameAttr][contextRef] = {
                    value: numericValue,
                    formatted: value
                };
            }
        }
        
        console.log(`📊 Found ${ixCount} ix: elements`);
    },
    
    /**
     * Extract financial data from tables
     */
    extractFromTables(doc, data) {
        console.log('📊 Extracting from tables...');
        
        const tables = doc.querySelectorAll('table');
        const financialPatterns = {
            revenue: /turnover|revenue|sales|income from/i,
            profit: /profit|loss|surplus|deficit/i,
            assets: /assets|property|investments/i,
            liabilities: /liabilities|creditors|borrowings/i,
            cash: /cash|bank|deposits/i,
            equity: /equity|capital|funds|reserves/i,
            employees: /employee|staff|personnel|workforce/i
        };
        
        tables.forEach((table, tableIndex) => {
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td, th'));
                
                if (cells.length >= 2) {
                    const labelCell = cells[0];
                    const label = labelCell.textContent.trim();
                    
                    // Check each pattern
                    Object.entries(financialPatterns).forEach(([category, pattern]) => {
                        if (pattern.test(label)) {
                            // Look for numeric values in remaining cells
                            for (let i = 1; i < cells.length; i++) {
                                const cellText = cells[i].textContent.trim();
                                const numericValue = this.parseNumericValue(cellText);
                                
                                if (numericValue !== null && numericValue !== 0) {
                                    if (!data.tables[category]) {
                                        data.tables[category] = [];
                                    }
                                    
                                    data.tables[category].push({
                                        label: label,
                                        value: numericValue,
                                        formatted: cellText,
                                        columnIndex: i,
                                        tableIndex: tableIndex
                                    });
                                    
                                    console.log(`📊 Table data: ${label} = ${cellText}`);
                                    break; // Take first numeric value
                                }
                            }
                        }
                    });
                }
            });
        });
    },
    
    /**
     * Extract using specific text patterns
     */
    extractUsingPatterns(doc, data) {
        console.log('📊 Extracting using patterns...');
        
        const bodyText = doc.body ? doc.body.innerText : '';
        
        const patterns = [
            { name: 'turnover', pattern: /turnover[:\s]+£?([\d,]+)/gi },
            { name: 'revenue', pattern: /revenue[:\s]+£?([\d,]+)/gi },
            { name: 'revenue', pattern: /sales[:\s]+£?([\d,]+)/gi },
            { name: 'revenue', pattern: /gross income[:\s]+£?([\d,]+)/gi },
            { name: 'profit', pattern: /profit[:\s]+£?([\d,]+)/gi },
            { name: 'loss', pattern: /loss[:\s]+£?([\d,]+)/gi },
            { name: 'totalAssets', pattern: /total assets[:\s]+£?([\d,]+)/gi },
            { name: 'totalAssets', pattern: /balance sheet total[:\s]+£?([\d,]+)/gi },
            { name: 'netAssets', pattern: /net assets[:\s]+£?([\d,]+)/gi },
            { name: 'cash', pattern: /cash (?:at|in) bank[:\s]+£?([\d,]+)/gi },
            { name: 'cash', pattern: /cash and cash equivalents[:\s]+£?([\d,]+)/gi },
            { name: 'employees', pattern: /(?:number of |average )?employees[:\s]+(\d+)/gi },
            { name: 'employees', pattern: /staff numbers?[:\s]+(\d+)/gi },
            { name: 'shareholdersFunds', pattern: /shareholders?.? funds[:\s]+£?([\d,]+)/gi },
            { name: 'shareholdersEquity', pattern: /(?:total )?equity[:\s]+£?([\d,]+)/gi }
        ];
        
        patterns.forEach(({ name, pattern }) => {
            const matches = [...bodyText.matchAll(pattern)];
            
            matches.forEach(match => {
                const value = parseFloat(match[1].replace(/,/g, ''));
                
                if (!isNaN(value)) {
                    if (!data.metrics[name]) {
                        data.metrics[name] = [];
                    }
                    
                    data.metrics[name].push({
                        value: value,
                        formatted: match[0],
                        context: match.input.substring(
                            Math.max(0, match.index - 50),
                            Math.min(match.input.length, match.index + match[0].length + 50)
                        )
                    });
                    
                    console.log(`📊 Pattern match: ${name} = ${value}`);
                }
            });
        });
    },
    
    /**
     * Extract context information (periods, dates)
     */
    extractContextInfo(doc, data) {
        console.log('📊 Extracting context information...');
        
        // Look for period information
        const periodPatterns = [
            /year end(?:ed|ing)? (\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /period end(?:ed|ing)? (\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /as at (\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
            /(\d{4}) annual accounts/gi
        ];
        
        const bodyText = doc.body ? doc.body.innerText : '';
        
        periodPatterns.forEach(pattern => {
            const matches = [...bodyText.matchAll(pattern)];
            matches.forEach(match => {
                if (!data.context.periods) {
                    data.context.periods = [];
                }
                data.context.periods.push(match[1]);
            });
        });
    },
    
    /**
     * Parse numeric value from text
     */
    parseNumericValue(text, scale = '0') {
        if (!text || typeof text !== 'string') return null;
        
        // Remove currency symbols and whitespace
        let cleanText = text.replace(/[£$€\s]/g, '');
        
        // Handle parentheses for negative numbers
        const isNegative = cleanText.includes('(') && cleanText.includes(')');
        cleanText = cleanText.replace(/[()]/g, '');
        
        // Remove commas
        cleanText = cleanText.replace(/,/g, '');
        
        // Handle dashes or empty values
        if (cleanText === '-' || cleanText === '' || cleanText === 'nil') {
            return 0;
        }
        
        // Parse the number
        let value = parseFloat(cleanText);
        
        if (isNaN(value)) return null;
        
        // Apply scale
        const scaleValue = parseInt(scale) || 0;
        value = value * Math.pow(10, scaleValue);
        
        // Apply negative sign if needed
        if (isNegative) {
            value = -Math.abs(value);
        }
        
        return value;
    },
    
    /**
     * Structure the extracted data into a consistent format
     */
    structureFinancialData(data) {
        console.log('📊 Structuring financial data...');
        
        const structured = {
            revenue: null,
            profit: null,
            totalAssets: null,
            netAssets: null,
            cash: null,
            totalLiabilities: null,
            shareholdersEquity: null,
            employees: null,
            currentAssets: null,
            currentLiabilities: null,
            rawData: data.raw,
            metadata: {
                periods: data.context.periods || [],
                extractionMethods: []
            }
        };
        
        // Priority order for data sources
        // 1. XBRL raw data
        // 2. Table data
        // 3. Pattern matches
        
        // Extract from XBRL raw data - comprehensive tag mappings
        const xbrlMappings = {
            revenue: [
                'uk-gaap:TurnoverRevenue', 
                'uk-gaap:Turnover', 
                'uk-gaap:TurnoverGrossOperatingRevenue',
                'uk-ifrs:Revenue',
                'uk-gaap:Sales',
                'uk-core:Turnover',
                'ix:nonFraction[name*="Turnover"]',
                'ix:nonFraction[name*="Revenue"]'
            ],
            profit: [
                'uk-gaap:ProfitLossForPeriod', 
                'uk-gaap:ProfitLossForFinancialYear', 
                'uk-gaap:ProfitLossOnOrdinaryActivitiesBeforeTax',
                'uk-ifrs:ProfitLoss',
                'uk-core:ProfitLoss'
            ],
            totalAssets: [
                'uk-gaap:TotalAssetsLessCurrrentLiabilities', 
                'uk-gaap:TotalAssetsLessCurrentLiabilities',
                'uk-gaap:BalanceSheetTotal', 
                'uk-gaap:TotalAssets',
                'uk-gaap:FixedAssets',
                'uk-ifrs:Assets',
                'uk-core:TotalAssets'
            ],
            netAssets: [
                'uk-gaap:NetAssetsLiabilities', 
                'uk-gaap:NetAssets',
                'uk-gaap:ShareholdersFunds',
                'uk-core:NetAssets'
            ],
            cash: [
                'uk-gaap:CashBankInHand', 
                'uk-gaap:CashAtBankInHand', 
                'uk-gaap:CashAtBank',
                'uk-ifrs:CashAndCashEquivalents',
                'uk-core:CashBankInHand'
            ],
            totalLiabilities: [
                'uk-gaap:Creditors', 
                'uk-gaap:TotalLiabilities', 
                'uk-gaap:TotalLiabilitiesAndShareholdersFunds',
                'uk-ifrs:Liabilities',
                'uk-core:TotalLiabilities'
            ],
            shareholdersEquity: [
                'uk-gaap:ShareholdersFunds', 
                'uk-gaap:TotalShareholdersFunds',
                'uk-gaap:CapitalReserves', 
                'uk-ifrs:Equity',
                'uk-core:ShareholdersFunds'
            ],
            employees: [
                'uk-gaap:AverageNumberEmployeesDuringPeriod', 
                'uk-core:AverageNumberEmployeesDuringPeriod',
                'uk-gaap:NumberOfEmployees',
                'uk-ifrs:NumberOfEmployees'
            ]
        };
        
        Object.entries(xbrlMappings).forEach(([metric, tags]) => {
            for (const tag of tags) {
                if (data.raw[tag]) {
                    const contexts = Object.keys(data.raw[tag]);
                    const currentContext = contexts.find(c => 
                        c.toLowerCase().includes('current') || 
                        c.toLowerCase().includes('instant')
                    ) || contexts[0];
                    
                    if (currentContext && data.raw[tag][currentContext]) {
                        structured[metric] = data.raw[tag][currentContext];
                        structured.metadata.extractionMethods.push(`${metric}: XBRL tag ${tag}`);
                        break;
                    }
                }
            }
        });
        
        // Fill gaps from table data
        Object.entries(data.tables).forEach(([category, values]) => {
            if (values.length > 0 && !structured[category]) {
                // Take the highest value (often the most recent)
                const sorted = values.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
                structured[category] = {
                    value: sorted[0].value,
                    formatted: sorted[0].formatted,
                    source: 'table'
                };
                structured.metadata.extractionMethods.push(`${category}: Table extraction`);
            }
        });
        
        // Fill remaining gaps from pattern matches
        Object.entries(data.metrics).forEach(([metric, values]) => {
            if (values.length > 0 && !structured[metric]) {
                structured[metric] = {
                    value: values[0].value,
                    formatted: values[0].formatted,
                    source: 'pattern'
                };
                structured.metadata.extractionMethods.push(`${metric}: Pattern matching`);
            }
        });
        
        console.log('📊 Structured data:', structured);
        return structured;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedXBRLParser;
}

if (typeof window !== 'undefined') {
    window.EnhancedXBRLParser = EnhancedXBRLParser;
}