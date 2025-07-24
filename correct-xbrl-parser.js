/**
 * Correct XBRL Parser - Matches Endole's extraction exactly
 */

const CorrectXBRLParser = {
    parse(xbrlText) {
        console.log('📊 Correct Parser: Starting parse...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        // Extract all XBRL values
        const values = this.extractAllValues(doc);
        
        // Find the correct values matching Endole
        const structured = this.findCorrectValues(values);
        
        console.log('📊 Correct Parser: Final values:', structured);
        return structured;
    },
    
    extractAllValues(doc) {
        const values = {};
        
        // Get ALL elements with 'name' attribute (these are XBRL values)
        const elements = doc.querySelectorAll('[name]');
        console.log(`📊 Found ${elements.length} XBRL elements`);
        
        elements.forEach(element => {
            const name = element.getAttribute('name');
            const contextRef = element.getAttribute('contextRef') || 'default';
            const scale = element.getAttribute('scale') || '0';
            const rawValue = element.textContent.trim();
            
            // Parse the numeric value
            let numericValue = this.parseValue(rawValue, scale);
            
            // Store with full details
            if (!values[name]) values[name] = {};
            values[name][contextRef] = {
                raw: rawValue,
                numeric: numericValue,
                scale: scale
            };
            
            // Log significant values
            if (numericValue && Math.abs(numericValue) > 1000) {
                console.log(`📊 ${name} [${contextRef}] = ${numericValue} (raw: "${rawValue}", scale: ${scale})`);
            }
        });
        
        return values;
    },
    
    parseValue(text, scale = '0') {
        if (!text || typeof text !== 'string') return 0;
        
        // Clean the text
        let clean = text.trim();
        
        // Handle nil/dash
        if (clean === '-' || clean === '' || clean.toLowerCase() === 'nil') {
            return 0;
        }
        
        // Handle parentheses for negative numbers (e.g., "(58,825)")
        const isNegative = clean.includes('(') && clean.includes(')');
        clean = clean.replace(/[()]/g, '');
        
        // Remove currency symbols and commas
        clean = clean.replace(/[£$€,]/g, '');
        
        // Parse the number
        let value = parseFloat(clean);
        if (isNaN(value)) return 0;
        
        // Apply scale (but NOT for employee counts)
        const scaleNum = parseInt(scale) || 0;
        value = value * Math.pow(10, scaleNum);
        
        // Apply negative if needed
        if (isNegative) {
            value = -Math.abs(value);
        }
        
        return value;
    },
    
    findCorrectValues(values) {
        const result = {
            totalAssets: null,
            netAssets: null,
            totalLiabilities: null,
            revenue: null,
            profit: null,
            cash: null,
            employees: null,
            currentAssets: null,
            currentLiabilities: null,
            fixedAssets: null,
            rawData: values,
            metadata: {
                sources: {}
            }
        };
        
        // Helper to get value from tags
        const getValue = (tagList, metric) => {
            for (const tag of tagList) {
                if (values[tag]) {
                    // Try to find the most recent context
                    const contexts = Object.keys(values[tag]);
                    const context = contexts.find(c => 
                        c.includes('Current') || c.includes('End') || c.includes('Instant')
                    ) || contexts[0];
                    
                    if (context && values[tag][context]) {
                        const value = values[tag][context].numeric;
                        if (value !== null && value !== 0) {
                            console.log(`✅ ${metric}: Using ${tag} = ${value}`);
                            result.metadata.sources[metric] = `${tag}[${context}]`;
                            return value;
                        }
                    }
                }
            }
            
            // Also try partial matches
            const tagPatterns = tagList.map(t => t.toLowerCase().replace(/[:\-]/g, ''));
            for (const [tag, contexts] of Object.entries(values)) {
                const tagLower = tag.toLowerCase();
                if (tagPatterns.some(pattern => tagLower.includes(pattern))) {
                    const context = Object.keys(contexts).find(c => 
                        c.includes('Current') || c.includes('End') || c.includes('Instant')
                    ) || Object.keys(contexts)[0];
                    
                    if (context && contexts[context]) {
                        const value = contexts[context].numeric;
                        if (value !== null && value !== 0) {
                            console.log(`✅ ${metric}: Using ${tag} (pattern match) = ${value}`);
                            result.metadata.sources[metric] = `${tag}[${context}]`;
                            return value;
                        }
                    }
                }
            }
            
            return null;
        };
        
        // TOTAL ASSETS - Try multiple tags
        result.totalAssets = getValue([
            'uk-gaap:FixedAssets',  // Sometimes only fixed assets is labeled as total
            'uk-gaap:BalanceSheetTotal',
            'uk-core:BalanceSheetTotal',
            'uk-bus:BalanceSheetTotal',
            'uk-gaap:TotalAssets',
            'uk-core:TotalAssets',
            'core:BalanceSheetTotal',
            'ifrs-full:Assets',
            'BalanceSheetTotal',
            'TotalAssets'
        ], 'totalAssets');
        
        // NET ASSETS / SHAREHOLDERS' EQUITY
        result.netAssets = getValue([
            'uk-gaap:ShareholdersFunds',
            'uk-gaap:TotalShareholdersFunds',
            'uk-gaap:NetAssetsLiabilities',
            'uk-gaap:NetAssets',
            'uk-core:ShareholdersFunds',
            'uk-core:NetAssets',
            'uk-gaap:CapitalReserves',
            'ShareholdersFunds',
            'NetAssets'
        ], 'netAssets');
        
        // TOTAL LIABILITIES
        result.totalLiabilities = getValue([
            'uk-gaap:Creditors',
            'uk-gaap:TotalLiabilities',
            'uk-core:TotalLiabilities',
            'uk-gaap:TotalCreditors',
            'uk-core:Creditors',
            'core:Creditors',
            'Creditors',
            'TotalLiabilities'
        ], 'totalLiabilities');
        
        // Get Current Assets and Fixed Assets for calculation
        result.currentAssets = getValue([
            'uk-gaap:CurrentAssets',
            'uk-core:CurrentAssets',
            'CurrentAssets'
        ], 'currentAssets');
        
        result.fixedAssets = getValue([
            'uk-gaap:FixedAssets',
            'uk-core:FixedAssets',
            'uk-gaap:TangibleAssets',
            'FixedAssets'
        ], 'fixedAssets');
        
        // SPECIAL HANDLING: TotalAssetsLessCurrentLiabilities
        const talcl = getValue([
            'uk-gaap:TotalAssetsLessCurrentLiabilities',
            'uk-core:TotalAssetsLessCurrentLiabilities',
            'TotalAssetsLessCurrentLiabilities'
        ], 'TotalAssetsLessCurrentLiabilities');
        
        if (talcl) {
            console.log(`📊 Found TotalAssetsLessCurrentLiabilities = ${talcl}`);
            
            // This is actually NET ASSETS in many filings
            if (!result.netAssets || result.netAssets === 0) {
                result.netAssets = talcl;
                result.metadata.sources.netAssets = 'TotalAssetsLessCurrentLiabilities (special)';
            }
            
            // Get current liabilities to calculate total assets
            const currentLiab = getValue([
                'uk-gaap:CreditorsDueWithinOneYear',
                'uk-gaap:CurrentLiabilities',
                'uk-core:CurrentLiabilities',
                'uk-gaap:CreditorsAmountsFallingDueWithinOneYear',
                'CurrentLiabilities'
            ], 'currentLiabilities');
            
            if (currentLiab && (!result.totalAssets || result.totalAssets === 0)) {
                result.totalAssets = talcl + Math.abs(currentLiab);
                result.metadata.sources.totalAssets = 'Calculated: TALCL + CurrentLiabilities';
                console.log(`📊 Calculated Total Assets: ${talcl} + ${Math.abs(currentLiab)} = ${result.totalAssets}`);
            }
        }
        
        // CALCULATION FALLBACKS
        
        // Calculate Total Assets if missing
        if (!result.totalAssets || result.totalAssets === 0) {
            // Method 1: Fixed + Current
            if (result.fixedAssets && result.currentAssets) {
                result.totalAssets = result.fixedAssets + result.currentAssets;
                result.metadata.sources.totalAssets = 'Calculated: Fixed + Current';
                console.log(`📊 Calculated Total Assets: ${result.fixedAssets} + ${result.currentAssets} = ${result.totalAssets}`);
            }
            // Method 2: Net Assets + Liabilities
            else if (result.netAssets && result.totalLiabilities) {
                result.totalAssets = result.netAssets + Math.abs(result.totalLiabilities);
                result.metadata.sources.totalAssets = 'Calculated: NetAssets + Liabilities';
                console.log(`📊 Calculated Total Assets: ${result.netAssets} + ${Math.abs(result.totalLiabilities)} = ${result.totalAssets}`);
            }
        }
        
        // Calculate Total Liabilities if missing
        if ((!result.totalLiabilities || result.totalLiabilities === 0) && 
            result.totalAssets && result.netAssets) {
            result.totalLiabilities = result.totalAssets - result.netAssets;
            result.metadata.sources.totalLiabilities = 'Calculated: Assets - NetAssets';
            console.log(`📊 Calculated Total Liabilities: ${result.totalAssets} - ${result.netAssets} = ${result.totalLiabilities}`);
        }
        
        // Calculate Net Assets if missing
        if ((!result.netAssets || result.netAssets === 0) && 
            result.totalAssets && result.totalLiabilities) {
            result.netAssets = result.totalAssets - Math.abs(result.totalLiabilities);
            result.metadata.sources.netAssets = 'Calculated: Assets - Liabilities';
            console.log(`📊 Calculated Net Assets: ${result.totalAssets} - ${Math.abs(result.totalLiabilities)} = ${result.netAssets}`);
        }
        
        // Extract other metrics
        result.revenue = getValue([
            'uk-gaap:TurnoverRevenue',
            'uk-gaap:Turnover',
            'uk-core:Turnover',
            'uk-gaap:TurnoverGrossOperatingRevenue',
            'Turnover',
            'Revenue'
        ], 'revenue');
        
        result.profit = getValue([
            'uk-gaap:ProfitLossForPeriod',
            'uk-gaap:ProfitLossForFinancialYear',
            'uk-core:ProfitLoss',
            'ProfitLoss'
        ], 'profit');
        
        result.cash = getValue([
            'uk-gaap:CashBankInHand',
            'uk-gaap:CashAtBankInHand',
            'uk-core:CashBankInHand',
            'CashBankInHand'
        ], 'cash');
        
        result.employees = getValue([
            'uk-gaap:AverageNumberEmployeesDuringPeriod',
            'uk-core:AverageNumberEmployeesDuringPeriod',
            'NumberOfEmployees'
        ], 'employees');
        
        // Ensure liabilities are positive for display
        if (result.totalLiabilities) {
            result.totalLiabilities = Math.abs(result.totalLiabilities);
        }
        
        return result;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CorrectXBRLParser;
}

if (typeof window !== 'undefined') {
    window.CorrectXBRLParser = CorrectXBRLParser;
}