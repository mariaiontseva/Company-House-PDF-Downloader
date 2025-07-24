/**
 * Fixed XBRL Parser for UK Companies House iXBRL documents
 * Correctly extracts Total Assets, Net Assets, and Total Liabilities
 */

const FixedXBRLParser = {
    parse(xbrlText) {
        console.log('📊 Fixed Parser: Starting parse...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        // Extract all raw XBRL data
        const rawData = this.extractAllXBRLData(doc);
        
        // Structure the financial data with proper calculations
        const structured = this.structureFinancialData(rawData);
        
        console.log('📊 Fixed Parser: Extraction complete');
        return structured;
    },
    
    extractAllXBRLData(doc) {
        const data = {};
        
        // Get all ix: elements
        const ixElements = doc.querySelectorAll('[name]');
        
        ixElements.forEach(element => {
            const name = element.getAttribute('name');
            if (!name) return;
            
            const contextRef = element.getAttribute('contextRef') || 'default';
            const value = element.textContent.trim();
            const scale = element.getAttribute('scale') || '0';
            const decimals = element.getAttribute('decimals');
            
            // Parse numeric value
            let numericValue = this.parseNumericValue(value);
            
            // Apply scale (but not for employee counts)
            if (!name.toLowerCase().includes('employee') && numericValue !== null) {
                numericValue = numericValue * Math.pow(10, parseInt(scale));
            }
            
            if (!data[name]) data[name] = {};
            
            data[name][contextRef] = {
                value: numericValue,
                formatted: value,
                scale: scale,
                decimals: decimals
            };
            
            console.log(`📊 Found: ${name} = ${numericValue} (context: ${contextRef})`);
        });
        
        return data;
    },
    
    parseNumericValue(text) {
        if (!text || typeof text !== 'string') return null;
        
        // Remove currency symbols and whitespace
        let cleanText = text.replace(/[£$€\s]/g, '');
        
        // Handle parentheses for negative numbers
        const isNegative = cleanText.includes('(') && cleanText.includes(')');
        cleanText = cleanText.replace(/[()]/g, '');
        
        // Remove commas
        cleanText = cleanText.replace(/,/g, '');
        
        // Handle nil/dash
        if (cleanText === '-' || cleanText === '' || cleanText.toLowerCase() === 'nil') {
            return 0;
        }
        
        // Parse the number
        let value = parseFloat(cleanText);
        
        if (isNaN(value)) return null;
        
        // Apply negative sign if needed
        if (isNegative) {
            value = -Math.abs(value);
        }
        
        return value;
    },
    
    structureFinancialData(rawData) {
        console.log('📊 Structuring financial data...');
        console.log('📊 Available tags:', Object.keys(rawData));
        
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
            fixedAssets: null,
            rawData: rawData,
            metadata: {
                extractionMethods: []
            }
        };
        
        // Helper function to get value from multiple possible tags
        const getValueFromTags = (tags, metric) => {
            for (const tag of tags) {
                // Check exact match
                if (rawData[tag]) {
                    const contexts = Object.keys(rawData[tag]);
                    const context = contexts.find(c => 
                        c.toLowerCase().includes('current') || 
                        c.toLowerCase().includes('instant') ||
                        c.toLowerCase().includes('end')
                    ) || contexts[0];
                    
                    if (context && rawData[tag][context]) {
                        console.log(`📊 ${metric}: Found exact match ${tag} = ${rawData[tag][context].value}`);
                        structured.metadata.extractionMethods.push(`${metric}: ${tag}`);
                        return rawData[tag][context];
                    }
                }
                
                // Check for tags containing the pattern
                const matchingTags = Object.keys(rawData).filter(key => 
                    key.toLowerCase().includes(tag.toLowerCase().replace(/[:\-]/g, ''))
                );
                
                if (matchingTags.length > 0) {
                    const matchedTag = matchingTags[0];
                    const contexts = Object.keys(rawData[matchedTag]);
                    const context = contexts[0];
                    
                    if (context && rawData[matchedTag][context]) {
                        console.log(`📊 ${metric}: Found pattern match ${matchedTag} = ${rawData[matchedTag][context].value}`);
                        structured.metadata.extractionMethods.push(`${metric}: ${matchedTag} (pattern)`);
                        return rawData[matchedTag][context];
                    }
                }
            }
            return null;
        };
        
        // Extract Fixed Assets
        structured.fixedAssets = getValueFromTags([
            'uk-gaap:FixedAssets',
            'uk-core:FixedAssets',
            'uk-gaap:TangibleAssets',
            'uk-core:TangibleAssets',
            'FixedAssets'
        ], 'fixedAssets');
        
        // Extract Current Assets
        structured.currentAssets = getValueFromTags([
            'uk-gaap:CurrentAssets',
            'uk-core:CurrentAssets',
            'CurrentAssets'
        ], 'currentAssets');
        
        // Extract Current Liabilities (usually negative)
        structured.currentLiabilities = getValueFromTags([
            'uk-gaap:Creditors',
            'uk-gaap:CreditorsAmountsFallingDueWithinOneYear',
            'uk-core:CurrentLiabilities',
            'uk-gaap:CurrentLiabilities',
            'Creditors'
        ], 'currentLiabilities');
        
        // Extract Total Liabilities
        structured.totalLiabilities = getValueFromTags([
            'uk-gaap:TotalLiabilities',
            'uk-core:TotalLiabilities',
            'uk-gaap:Creditors',
            'TotalLiabilities'
        ], 'totalLiabilities');
        
        // Extract Net Assets / Shareholders' Equity
        structured.netAssets = getValueFromTags([
            'uk-gaap:ShareholdersFunds',
            'uk-gaap:TotalShareholdersFunds',
            'uk-gaap:NetAssetsLiabilities',
            'uk-gaap:NetAssets',
            'uk-core:NetAssets',
            'uk-core:ShareholdersFunds',
            'ShareholdersFunds',
            'NetAssets'
        ], 'netAssets');
        
        // Extract Total Assets - Try direct tags first
        structured.totalAssets = getValueFromTags([
            'uk-gaap:BalanceSheetTotal',
            'uk-core:BalanceSheetTotal',
            'uk-gaap:TotalAssets',
            'uk-core:TotalAssets',
            'BalanceSheetTotal',
            'TotalAssets'
        ], 'totalAssets');
        
        // Special handling for TotalAssetsLessCurrentLiabilities
        const talcl = getValueFromTags([
            'uk-gaap:TotalAssetsLessCurrentLiabilities',
            'uk-core:TotalAssetsLessCurrentLiabilities',
            'TotalAssetsLessCurrentLiabilities'
        ], 'TotalAssetsLessCurrentLiabilities');
        
        if (talcl && talcl.value) {
            console.log(`📊 Found TotalAssetsLessCurrentLiabilities: ${talcl.value}`);
            
            // This is actually Net Assets in many UK filings
            if (!structured.netAssets || structured.netAssets.value === 0) {
                structured.netAssets = talcl;
                structured.metadata.extractionMethods.push('netAssets: From TotalAssetsLessCurrentLiabilities');
            }
            
            // If we have current liabilities, we can calculate total assets
            if (structured.currentLiabilities && structured.currentLiabilities.value) {
                const calculatedTotalAssets = talcl.value + Math.abs(structured.currentLiabilities.value);
                console.log(`📊 Calculating Total Assets: ${talcl.value} + ${Math.abs(structured.currentLiabilities.value)} = ${calculatedTotalAssets}`);
                
                if (!structured.totalAssets || structured.totalAssets.value === 0) {
                    structured.totalAssets = {
                        value: calculatedTotalAssets,
                        formatted: calculatedTotalAssets.toString(),
                        source: 'calculated',
                        calculation: 'TotalAssetsLessCurrentLiabilities + CurrentLiabilities'
                    };
                    structured.metadata.extractionMethods.push('totalAssets: Calculated from TALCL + Current Liabilities');
                }
            }
        }
        
        // Calculate Total Assets if missing but we have components
        if (!structured.totalAssets || structured.totalAssets.value === 0) {
            // Method 1: Fixed Assets + Current Assets
            if (structured.fixedAssets && structured.currentAssets) {
                const calculatedAssets = (structured.fixedAssets.value || 0) + (structured.currentAssets.value || 0);
                console.log(`📊 Calculating Total Assets from components: ${structured.fixedAssets.value} + ${structured.currentAssets.value} = ${calculatedAssets}`);
                
                structured.totalAssets = {
                    value: calculatedAssets,
                    formatted: calculatedAssets.toString(),
                    source: 'calculated',
                    calculation: 'FixedAssets + CurrentAssets'
                };
                structured.metadata.extractionMethods.push('totalAssets: Calculated from Fixed + Current Assets');
            }
            // Method 2: Net Assets + Total Liabilities
            else if (structured.netAssets && structured.totalLiabilities) {
                const calculatedAssets = Math.abs(structured.netAssets.value || 0) + Math.abs(structured.totalLiabilities.value || 0);
                console.log(`📊 Calculating Total Assets: ${structured.netAssets.value} + ${structured.totalLiabilities.value} = ${calculatedAssets}`);
                
                structured.totalAssets = {
                    value: calculatedAssets,
                    formatted: calculatedAssets.toString(),
                    source: 'calculated',
                    calculation: 'NetAssets + TotalLiabilities'
                };
                structured.metadata.extractionMethods.push('totalAssets: Calculated from Net Assets + Total Liabilities');
            }
        }
        
        // Calculate missing values using accounting equation
        // Assets = Liabilities + Equity
        
        // Calculate Total Liabilities if missing
        if ((!structured.totalLiabilities || structured.totalLiabilities.value === 0) && 
            structured.totalAssets && structured.netAssets) {
            structured.totalLiabilities = {
                value: structured.totalAssets.value - structured.netAssets.value,
                formatted: (structured.totalAssets.value - structured.netAssets.value).toString(),
                source: 'calculated',
                calculation: 'TotalAssets - NetAssets'
            };
            structured.metadata.extractionMethods.push('totalLiabilities: Calculated from Total Assets - Net Assets');
        }
        
        // Calculate Net Assets if missing
        if ((!structured.netAssets || structured.netAssets.value === 0) && 
            structured.totalAssets && structured.totalLiabilities) {
            structured.netAssets = {
                value: structured.totalAssets.value - structured.totalLiabilities.value,
                formatted: (structured.totalAssets.value - structured.totalLiabilities.value).toString(),
                source: 'calculated',
                calculation: 'TotalAssets - TotalLiabilities'
            };
            structured.metadata.extractionMethods.push('netAssets: Calculated from Total Assets - Total Liabilities');
        }
        
        // Extract other metrics
        structured.revenue = getValueFromTags([
            'uk-gaap:TurnoverRevenue',
            'uk-gaap:Turnover',
            'uk-gaap:TurnoverGrossOperatingRevenue',
            'uk-core:Turnover',
            'uk-ifrs:Revenue',
            'Turnover',
            'Revenue'
        ], 'revenue');
        
        structured.profit = getValueFromTags([
            'uk-gaap:ProfitLossForPeriod',
            'uk-gaap:ProfitLossForFinancialYear',
            'uk-gaap:ProfitLossOnOrdinaryActivitiesBeforeTax',
            'uk-core:ProfitLoss',
            'ProfitLoss'
        ], 'profit');
        
        structured.cash = getValueFromTags([
            'uk-gaap:CashBankInHand',
            'uk-gaap:CashAtBankInHand',
            'uk-core:CashBankInHand',
            'CashBankInHand'
        ], 'cash');
        
        structured.employees = getValueFromTags([
            'uk-gaap:AverageNumberEmployeesDuringPeriod',
            'uk-core:AverageNumberEmployeesDuringPeriod',
            'AverageNumberEmployeesDuringPeriod'
        ], 'employees');
        
        // Log final values
        console.log('📊 Final structured data:', {
            totalAssets: structured.totalAssets?.value,
            netAssets: structured.netAssets?.value,
            totalLiabilities: structured.totalLiabilities?.value,
            verification: {
                'Assets = Liabilities + Equity': structured.totalAssets?.value === 
                    (structured.totalLiabilities?.value || 0) + (structured.netAssets?.value || 0)
            }
        });
        
        return structured;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FixedXBRLParser;
}

if (typeof window !== 'undefined') {
    window.FixedXBRLParser = FixedXBRLParser;
}