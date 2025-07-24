/**
 * Filleted Accounts Parser
 * Handles the limited data available in filleted accounts and tries to match Endole's calculations
 */

const FilletedAccountsParser = {
    /**
     * Parse filleted accounts and calculate missing values
     */
    parse(xbrlText) {
        console.log('📊 Filleted Parser: Starting parse...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        // Extract all values
        const values = this.extractValues(doc);
        
        // Build structured data
        const result = this.buildStructuredData(values);
        
        console.log('📊 Filleted Parser: Result:', result);
        return result;
    },
    
    extractValues(doc) {
        const values = {};
        
        // Get all ix:nonFraction elements
        const elements = doc.querySelectorAll('ix\\:nonFraction, *[name]');
        console.log(`📊 Found ${elements.length} value elements`);
        
        elements.forEach(element => {
            const name = element.getAttribute('name');
            if (!name) return;
            
            const contextRef = element.getAttribute('contextRef') || 'default';
            const unitRef = element.getAttribute('unitRef');
            const decimals = element.getAttribute('decimals') || '0';
            const rawValue = element.textContent.trim();
            
            // Parse numeric value
            let numericValue = 0;
            if (unitRef === 'GBP' || unitRef === 'Pure') {
                // Remove formatting
                const cleanValue = rawValue.replace(/[£,()]/g, '').trim();
                numericValue = parseFloat(cleanValue) || 0;
                
                // Handle parentheses as negative
                if (rawValue.includes('(') && rawValue.includes(')')) {
                    numericValue = -Math.abs(numericValue);
                }
            }
            
            if (!values[name]) values[name] = {};
            values[name][contextRef] = {
                raw: rawValue,
                numeric: numericValue,
                unitRef: unitRef,
                decimals: decimals
            };
            
            if (Math.abs(numericValue) > 0) {
                console.log(`📊 ${name}[${contextRef}] = ${numericValue} (${rawValue})`);
            }
        });
        
        return values;
    },
    
    buildStructuredData(values) {
        const result = {
            totalAssets: null,
            netAssets: null,
            totalLiabilities: null,
            currentAssets: null,
            fixedAssets: null,
            cash: null,
            creditors: null,
            shareholdersFunds: null,
            metadata: {
                isFilletedAccounts: true,
                sources: {}
            }
        };
        
        // Helper to get current year value
        const getCurrentValue = (tagList) => {
            for (const tag of tagList) {
                if (values[tag]) {
                    // Look for current year contexts
                    const contexts = Object.keys(values[tag]);
                    const currentContext = contexts.find(c => 
                        c.includes('CurrYear') || 
                        c.includes('CurrentYear') ||
                        c.includes('End') && !c.includes('Start') && !c.includes('Comp')
                    ) || contexts[0];
                    
                    if (currentContext && values[tag][currentContext]) {
                        return values[tag][currentContext].numeric;
                    }
                }
            }
            return null;
        };
        
        // Extract Net Assets / Shareholders' Funds
        result.netAssets = getCurrentValue([
            'core:NetAssetsLiabilities',
            'core:Equity',
            'core:ShareholdersFunds',
            'uk-gaap:ShareholdersFunds',
            'uk-gaap:NetAssetsLiabilities'
        ]);
        
        // Extract Creditors (Total Liabilities)
        // Note: Need to get the total creditors, not the breakdown
        const creditorsContexts = values['core:Creditors'] ? Object.keys(values['core:Creditors']) : [];
        const totalCreditorsContext = creditorsContexts.find(c => 
            c.includes('Dim003') || // This seems to be the dimension for total creditors
            (c.includes('CurrYear') && !c.includes('Dim'))
        );
        
        if (totalCreditorsContext && values['core:Creditors'][totalCreditorsContext]) {
            result.totalLiabilities = Math.abs(values['core:Creditors'][totalCreditorsContext].numeric);
        }
        
        // Extract Cash
        result.cash = getCurrentValue([
            'core:CashBankOnHand',
            'uk-gaap:CashBankInHand',
            'uk-gaap:CashAtBankInHand'
        ]);
        
        // For filleted accounts, we need to estimate Total Assets
        // Method 1: If we have Net Assets and Total Liabilities
        if (result.netAssets !== null && result.totalLiabilities !== null) {
            result.totalAssets = result.netAssets + result.totalLiabilities;
            result.metadata.sources.totalAssets = 'Calculated: NetAssets + Liabilities';
        }
        
        // Extract other available data
        result.shareholdersFunds = result.netAssets; // These are the same in filleted accounts
        
        // Try to get Net Current Assets which might give us Current Assets
        const netCurrentAssets = getCurrentValue([
            'core:NetCurrentAssetsLiabilities'
        ]);
        
        // If Net Current Assets equals Net Assets, then there are no fixed assets
        if (netCurrentAssets !== null && netCurrentAssets === result.netAssets) {
            result.fixedAssets = 0;
            result.currentAssets = result.totalAssets; // All assets are current
            result.metadata.sources.assetBreakdown = 'No fixed assets (Net Current Assets = Net Assets)';
        }
        
        // Store raw data for debugging
        result.rawData = values;
        
        // Add warning about filleted accounts
        result.metadata.warning = 'This is a filleted account with limited financial information';
        
        return result;
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilletedAccountsParser;
}

if (typeof window !== 'undefined') {
    window.FilletedAccountsParser = FilletedAccountsParser;
}