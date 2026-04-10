/**
 * Real XBRL Parser - Extracts actual values from Companies House XBRL
 */

const RealXBRLParser = {
    parse(xbrlText) {
        console.log('📊 Real XBRL Parser: Starting extraction...');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(xbrlText, 'text/html');
        
        // Extract all XBRL values with context
        const values = {};
        
        // Find all ix:nonFraction elements (these contain the numeric values)
        const elements = doc.querySelectorAll('ix\\:nonFraction, *[name*="core:"], *[name*="uk-gaap:"], *[name*="bus:"], *[name*="uk-bus:"], *[name*="uk-direp:"]');
        
        elements.forEach(element => {
            const name = element.getAttribute('name');
            if (!name) return;
            
            const contextRef = element.getAttribute('contextRef') || 'default';
            const unitRef = element.getAttribute('unitRef');
            const decimals = element.getAttribute('decimals') || '0';
            const scale = element.getAttribute('scale') || '0';
            const format = element.getAttribute('format');
            const rawValue = element.textContent.trim();
            
            // Debug employee-related tags
            if (name.toLowerCase().includes('employee') || name.toLowerCase().includes('staff')) {
                console.log(`📊 Found employee tag: ${name} = ${rawValue} (context: ${contextRef})`);
            }
            
            // Parse numeric value
            let numericValue = 0;
            if (unitRef === 'GBP' || unitRef === 'Pure' || !unitRef) {
                // Remove formatting
                let cleanValue = rawValue.replace(/[£$€,\s]/g, '');
                
                // Handle parentheses as negative
                const isNegative = rawValue.includes('(') && rawValue.includes(')');
                cleanValue = cleanValue.replace(/[()]/g, '');
                
                numericValue = parseFloat(cleanValue) || 0;
                
                // Apply scale
                const scaleNum = parseInt(scale) || 0;
                numericValue = numericValue * Math.pow(10, scaleNum);
                
                if (isNegative) {
                    numericValue = -Math.abs(numericValue);
                }
            }
            
            if (!values[name]) values[name] = {};
            values[name][contextRef] = {
                raw: rawValue,
                numeric: numericValue,
                unitRef: unitRef,
                decimals: decimals,
                scale: scale,
                format: format
            };
        });
        
        // Extract structured financial data
        const result = this.extractFinancialData(values);
        
        // If no employees found, try enhanced extraction
        if (!result.employees && typeof EnhancedEmployeeParser !== 'undefined') {
            console.log('No employees found with standard tags, trying enhanced extraction...');
            const enhancedResult = EnhancedEmployeeParser.extractEmployees(xbrlText);
            if (enhancedResult) {
                result.employees = enhancedResult;
            }
        }
        
        console.log('📊 Real XBRL Parser: Extracted data:', result);
        return result;
    },
    
    extractFinancialData(values) {
        // Helper to get current year value
        const getCurrentValue = (tagList) => {
            for (const tag of tagList) {
                if (values[tag]) {
                    // Look for current year contexts
                    const contexts = Object.keys(values[tag]);
                    
                    // Priority order for contexts
                    const priorityContexts = [
                        'CurrYearEnd',
                        'CurrentYearEnd', 
                        'CurrentYearInstant',
                        'CurrYearEnd_Dim003', // For creditors total
                        'CurrentPeriodEnd'
                    ];
                    
                    let currentContext = null;
                    for (const pc of priorityContexts) {
                        if (contexts.includes(pc)) {
                            currentContext = pc;
                            break;
                        }
                    }
                    
                    // If no priority context found, look for any current year context
                    if (!currentContext) {
                        currentContext = contexts.find(c => 
                            (c.includes('Curr') || c.includes('Current')) && 
                            !c.includes('Start') && 
                            !c.includes('Previous') &&
                            !c.includes('Comp')
                        ) || contexts[0];
                    }
                    
                    if (currentContext && values[tag][currentContext]) {
                        const value = values[tag][currentContext].numeric;
                        if (value !== 0) {
                            console.log(`Found ${tag} = ${value} in context ${currentContext}`);
                            return {
                                value: value,
                                source: tag,
                                context: currentContext
                            };
                        }
                    }
                }
            }
            return null;
        };
        
        const result = {
            // Balance Sheet Items
            fixedAssets: getCurrentValue([
                'core:FixedAssets',
                'uk-gaap:FixedAssets',
                'uk-core:FixedAssets',
                'core:PropertyPlantEquipment'
            ]),
            
            currentAssets: getCurrentValue([
                'core:CurrentAssets',
                'uk-gaap:CurrentAssets',
                'uk-core:CurrentAssets'
            ]),
            
            cash: getCurrentValue([
                'core:CashBankOnHand',
                'uk-gaap:CashBankInHand',
                'uk-gaap:CashAtBankInHand',
                'uk-core:CashBankOnHand'
            ]),
            
            totalAssetsLessCurrentLiabilities: getCurrentValue([
                'core:TotalAssetsLessCurrentLiabilities',
                'uk-gaap:TotalAssetsLessCurrentLiabilities',
                'uk-core:TotalAssetsLessCurrentLiabilities'
            ]),
            
            netAssets: getCurrentValue([
                'core:NetAssetsLiabilities',
                'uk-gaap:NetAssetsLiabilities',
                'uk-gaap:NetAssets',
                'uk-core:NetAssets',
                'core:ShareholdersFunds',
                'uk-gaap:ShareholdersFunds'
            ]),
            
            shareholdersFunds: getCurrentValue([
                'core:Equity',
                'uk-gaap:ShareholdersFunds',
                'uk-gaap:TotalShareholdersFunds',
                'uk-gaap:CapitalReserves',
                'uk-core:ShareholdersFunds'
            ]),
            
            creditorsWithinOneYear: getCurrentValue([
                'core:Creditors',  // With Dim003 context
                'uk-gaap:CreditorsDueWithinOneYear',
                'uk-gaap:CreditorsAmountsFallingDueWithinOneYear',
                'uk-core:CreditorsDueWithinOneYear'
            ]),
            
            creditorsAfterOneYear: getCurrentValue([
                'uk-gaap:CreditorsDueAfterOneYear',
                'uk-gaap:CreditorsAmountsFallingDueAfterMoreThanOneYear',
                'uk-core:CreditorsDueAfterOneYear'
            ]),
            
            // Try to get total from balance sheet
            balanceSheetTotal: getCurrentValue([
                'core:BalanceSheetTotal',
                'uk-gaap:BalanceSheetTotal',
                'uk-core:BalanceSheetTotal',
                'uk-bus:BalanceSheetTotal'
            ]),
            
            // Revenue/Turnover
            revenue: getCurrentValue([
                'core:Turnover',
                'uk-gaap:Turnover',
                'uk-gaap:TurnoverRevenue',
                'uk-core:Turnover',
                'core:Revenue',
                'uk-gaap:Revenue'
            ]),
            
            // Number of employees - try standard tags first
            employees: getCurrentValue([
                'core:AverageNumberEmployees',
                'uk-gaap:AverageNumberEmployeesDuringPeriod',
                'uk-core:AverageNumberEmployees',
                'bus:AverageNumberEmployees',
                'uk-gaap:NumberEmployees',
                'uk-bus:AverageNumberEmployees',
                'uk-bus:EmployeesTotal',
                'uk-bus:AverageNumberEmployeesDuringPeriod',
                'uk-direp:AverageNumberUKEmployees',
                'uk-direp:NumberDirectorsExecutives',
                'uk-direp:StatutoryEmployeeNumbers',
                'uk-gaap:EmployeesTotal',
                'uk-core:EmployeesTotal',
                'uk-core:NumberEmployees',
                'AverageNumberEmployeesDuringPeriod',
                'AverageNumberEmployees',
                'NumberEmployees',
                'EmployeesTotal'
            ]),
            
            // Get accounting period info
            accountingPeriodEnd: null,
            companyName: null,
            rawValues: values
        };
        
        // Extract accounting period
        if (values['bus:EndDateForPeriodCoveredByReport']) {
            const endDateContexts = Object.keys(values['bus:EndDateForPeriodCoveredByReport']);
            if (endDateContexts.length > 0) {
                result.accountingPeriodEnd = values['bus:EndDateForPeriodCoveredByReport'][endDateContexts[0]].raw;
            }
        }
        
        // Extract company name
        if (values['bus:EntityCurrentLegalOrRegisteredName']) {
            const nameContexts = Object.keys(values['bus:EntityCurrentLegalOrRegisteredName']);
            if (nameContexts.length > 0) {
                result.companyName = values['bus:EntityCurrentLegalOrRegisteredName'][nameContexts[0]].raw;
            }
        }
        
        // Calculate Total Assets if not directly available
        if (!result.balanceSheetTotal) {
            // Method 1: Fixed + Current
            if (result.fixedAssets && result.currentAssets) {
                result.totalAssets = {
                    value: result.fixedAssets.value + result.currentAssets.value,
                    source: 'Calculated: Fixed + Current',
                    calculation: `${result.fixedAssets.value} + ${result.currentAssets.value}`
                };
            }
            // Method 2: TALCL + Current Liabilities
            else if (result.totalAssetsLessCurrentLiabilities && result.creditorsWithinOneYear) {
                result.totalAssets = {
                    value: result.totalAssetsLessCurrentLiabilities.value + Math.abs(result.creditorsWithinOneYear.value),
                    source: 'Calculated: TALCL + Current Liabilities',
                    calculation: `${result.totalAssetsLessCurrentLiabilities.value} + ${Math.abs(result.creditorsWithinOneYear.value)}`
                };
            }
            // Method 3: Net Assets + Total Liabilities
            else if (result.netAssets && result.creditorsWithinOneYear) {
                const totalLiabilities = Math.abs(result.creditorsWithinOneYear.value) + 
                                       (result.creditorsAfterOneYear ? Math.abs(result.creditorsAfterOneYear.value) : 0);
                result.totalAssets = {
                    value: result.netAssets.value + totalLiabilities,
                    source: 'Calculated: Net Assets + Total Liabilities',
                    calculation: `${result.netAssets.value} + ${totalLiabilities}`
                };
            }
        } else {
            result.totalAssets = result.balanceSheetTotal;
        }
        
        // Calculate Total Liabilities
        if (result.creditorsWithinOneYear) {
            const totalLiabilities = Math.abs(result.creditorsWithinOneYear.value) + 
                                   (result.creditorsAfterOneYear ? Math.abs(result.creditorsAfterOneYear.value) : 0);
            result.totalLiabilities = {
                value: totalLiabilities,
                source: result.creditorsAfterOneYear ? 'Current + Long-term' : 'Current only'
            };
        }
        
        return result;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.RealXBRLParser = RealXBRLParser;
}