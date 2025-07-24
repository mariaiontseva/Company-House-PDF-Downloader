// Enhanced Employee Extraction for XBRL
const EnhancedEmployeeParser = {
    // Comprehensive list of employee-related XBRL tags
    employeeTags: [
        // UK GAAP tags
        'uk-gaap:AverageNumberEmployeesDuringPeriod',
        'uk-gaap:NumberEmployees',
        'uk-gaap:EmployeesTotal',
        'uk-gaap:AverageNumberEmployees',
        
        // UK Core tags
        'uk-core:AverageNumberEmployees',
        'uk-core:EmployeesTotal',
        'uk-core:NumberEmployees',
        
        // UK Business tags
        'uk-bus:AverageNumberEmployees',
        'uk-bus:EmployeesTotal',
        'uk-bus:AverageNumberEmployeesDuringPeriod',
        'uk-bus:NumberEmployees',
        
        // UK Directors Report tags
        'uk-direp:AverageNumberUKEmployees',
        'uk-direp:NumberDirectorsExecutives',
        'uk-direp:StatutoryEmployeeNumbers',
        'uk-direp:AverageNumberEmployees',
        
        // Core/Common tags
        'core:AverageNumberEmployees',
        'core:NumberEmployees',
        'core:EmployeesTotal',
        
        // Bus tags
        'bus:AverageNumberEmployees',
        'bus:EmployeesTotal',
        
        // Generic patterns (without namespace)
        'AverageNumberEmployeesDuringPeriod',
        'AverageNumberEmployees',
        'NumberEmployees',
        'EmployeesTotal',
        'StatutoryEmployeeNumbers',
        'AverageNumberUKEmployees',
        'TotalNumberEmployees',
        'NumberDirectorsExecutives',
        
        // FRS101/102 specific
        'uk-gaap-frs101:AverageNumberEmployeesDuringPeriod',
        'uk-gaap-frs102:AverageNumberEmployeesDuringPeriod',
        
        // Additional variations
        'NumberOfEmployees',
        'EmployeeNumbers',
        'StaffNumbers',
        'HeadCount',
        'AverageHeadcount',
        'AverageStaffNumbers'
    ],
    
    // Extract employees from XBRL text
    extractEmployees(xbrlText) {
        console.log('Enhanced employee extraction starting...');
        
        // Try multiple extraction methods
        let results = [];
        
        // Method 1: Direct tag search in raw text
        let result = this.searchDirectTags(xbrlText);
        if (result) results.push(result);
        
        // Method 2: Parse as DOM and search
        result = this.searchInDOM(xbrlText);
        if (result) results.push(result);
        
        // Method 3: Regular expression patterns
        result = this.searchWithRegex(xbrlText);
        if (result) results.push(result);
        
        // Method 4: Search in text content for employee numbers
        result = this.searchInTextContent(xbrlText);
        if (result) results.push(result);
        
        if (results.length === 0) {
            console.log('No employee data found with any method');
            return null;
        }
        
        // If we have multiple results, prefer non-zero values
        const nonZeroResults = results.filter(r => r.value > 0);
        if (nonZeroResults.length > 0) {
            console.log('Found non-zero employee count:', nonZeroResults[0]);
            return nonZeroResults[0];
        }
        
        // Return the first result if all are zero
        return results[0];
    },
    
    // Method 1: Direct tag search
    searchDirectTags(xbrlText) {
        for (const tag of this.employeeTags) {
            // Try different patterns
            const patterns = [
                // Standard XBRL format
                new RegExp(`<(?:ix:nonFraction|[^:>]+:nonFraction)[^>]+name=["']${tag}["'][^>]*>\\s*([0-9,]+)\\s*<`, 'i'),
                // Without namespace
                new RegExp(`name=["']${tag}["'][^>]*>\\s*([0-9,]+)\\s*<`, 'i'),
                // As attribute
                new RegExp(`${tag}["']?[^>]*>\\s*([0-9,]+)\\s*<`, 'i'),
                // In context
                new RegExp(`>${tag}</[^>]+>\\s*([0-9,]+)`, 'i')
            ];
            
            for (const pattern of patterns) {
                const match = xbrlText.match(pattern);
                if (match) {
                    const value = parseInt(match[1].replace(/,/g, ''));
                    if (!isNaN(value) && value > 0) {
                        console.log(`Found employees with tag ${tag}: ${value}`);
                        return {
                            value: value,
                            source: tag
                        };
                    }
                }
            }
        }
        return null;
    },
    
    // Method 2: DOM parsing
    searchInDOM(xbrlText) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xbrlText, 'text/html');
            
            // First, look for table cells containing employee data
            const cells = doc.querySelectorAll('td, th');
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                const text = cell.textContent.toLowerCase().trim();
                const id = cell.id ? cell.id.toLowerCase() : '';
                
                // Look for cells containing employee-related text or with employee-related IDs
                if (text.includes('average number of employees') || 
                    text.includes('employees during') || 
                    text.includes('average number of persons employed') ||
                    text.includes('persons employed') ||
                    id.includes('employeesnote')) {
                    // Check the next few cells for numbers
                    for (let j = i + 1; j < Math.min(i + 5, cells.length); j++) {
                        const nextCell = cells[j];
                        const cellText = nextCell.textContent.trim();
                        const value = parseInt(cellText.replace(/,/g, ''));
                        
                        if (!isNaN(value) && value >= 0 && value < 1000000) {
                            console.log(`Found employees in table cell: ${value}`);
                            return {
                                value: value,
                                source: 'Table cell'
                            };
                        }
                    }
                }
            }
            
            // Also check for specific employee note cells by ID
            const employeeCell = doc.querySelector('#employeesNote-curr-val');
            if (employeeCell) {
                const value = parseInt(employeeCell.textContent.replace(/,/g, ''));
                if (!isNaN(value) && value >= 0 && value < 1000000) {
                    console.log(`Found employees in employeesNote cell: ${value}`);
                    return {
                        value: value,
                        source: 'Employee note cell'
                    };
                }
            }
            
            // Search for elements with name attribute
            const elements = doc.querySelectorAll('[name]');
            for (const element of elements) {
                const name = element.getAttribute('name');
                
                // Check if it matches any employee tag
                for (const tag of this.employeeTags) {
                    if (name && (name === tag || name.endsWith(':' + tag) || name.includes(tag))) {
                        const value = parseInt(element.textContent.replace(/,/g, ''));
                        if (!isNaN(value) && value >= 0) {
                            console.log(`Found employees in DOM with ${name}: ${value}`);
                            return {
                                value: value,
                                source: name
                            };
                        }
                    }
                }
            }
            
            // Also check ix:nonFraction and ix:nonNumeric elements
            const ixElements = doc.querySelectorAll('ix\\:nonFraction, ix\\:nonNumeric, nonFraction, nonNumeric, [name*="employ" i], [name*="staff" i], [name*="headcount" i]');
            for (const element of ixElements) {
                const name = element.getAttribute('name');
                if (name && (name.toLowerCase().includes('employ') || name.toLowerCase().includes('staff') || name.toLowerCase().includes('headcount'))) {
                    const value = parseInt(element.textContent.replace(/,/g, ''));
                    if (!isNaN(value) && value >= 0) {
                        console.log(`Found employees in XBRL element with ${name}: ${value}`);
                        return {
                            value: value,
                            source: name
                        };
                    }
                }
            }
        } catch (error) {
            console.error('DOM parsing error:', error);
        }
        return null;
    },
    
    // Method 3: Regular expression search
    searchWithRegex(xbrlText) {
        // Look for common patterns in the text
        const patterns = [
            // "Average number of persons employed by the company 1"
            /average\s+number\s+of\s+persons\s+employed\s+by\s+the\s+company\s+([0-9,]+)/i,
            // Table format: "Average number of employees during the year    1        1"
            /average\s+number\s+of\s+employees\s+during\s+the\s+year\s+([0-9,]+)\s+([0-9,]+)/i,
            // "During the year the average number of employees was 123"
            /during\s+the\s+year\s+the\s+average\s+number\s+of\s+employees\s+was\s+([0-9,]+)/i,
            // "average number of employees was 123"
            /average\s+number\s+of\s+employees\s+was\s+([0-9,]+)/i,
            // "Average number of employees: 123"
            /average\s+number\s+of\s+employees[:\s]+([0-9,]+)/i,
            // "Number of employees 123"
            /number\s+of\s+employees[:\s]+([0-9,]+)/i,
            // "Staff numbers: 123"
            /staff\s+numbers?[:\s]+([0-9,]+)/i,
            // "Headcount: 123"
            /headcount[:\s]+([0-9,]+)/i,
            // Table format "Employees | 123"
            /employees\s*\|\s*([0-9,]+)/i,
            // In parentheses "(123 employees)"
            /\(([0-9,]+)\s+employees\)/i,
            // "1 Employees" pattern - number before employees
            /([0-9,]+)\s+employees(?!\s*(?:19|20)\d{2})/i
        ];
        
        for (const pattern of patterns) {
            const match = xbrlText.match(pattern);
            if (match) {
                const value = parseInt(match[1].replace(/,/g, ''));
                if (!isNaN(value) && value > 0 && value < 1000000) { // Sanity check
                    console.log(`Found employees with regex pattern: ${value}`);
                    return {
                        value: value,
                        source: 'Text pattern match'
                    };
                }
            }
        }
        return null;
    },
    
    // Method 4: Search in visible text content
    searchInTextContent(xbrlText) {
        // Remove tags to get text content
        const textContent = xbrlText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        
        // Look for various table formats
        const tablePatterns = [
            // Pattern: "Average number of persons employed by the company 1 1"
            /average\s+number\s+of\s+persons\s+employed\s+by\s+the\s+company\s+([0-9,]+)\s+[0-9,]+/i,
            // Pattern: "Average number of employees 2024 2023 Average number of employees during the year 1 1"
            /average\s+number\s+of\s+employees\s+\d{4}\s+\d{4}\s+average\s+number\s+of\s+employees\s+during\s+the\s+year\s+([0-9,]+)\s+([0-9,]+)/i,
            // Pattern: "Average number of employees during the year 1 1"  
            /average\s+number\s+of\s+employees\s+during\s+the\s+year\s+([0-9,]+)\s+[0-9,]+/i,
            // Pattern: "Average number of employees (space) 1"
            /average\s+number\s+of\s+employees\s+(?:during\s+the\s+year\s+)?([0-9,]+)(?:\s|$)/i,
            // Pattern in simplified format
            /employees\s+during\s+the\s+year\s+([0-9,]+)/i
        ];
        
        for (const pattern of tablePatterns) {
            const tableMatch = textContent.match(pattern);
            if (tableMatch) {
                const value = parseInt(tableMatch[1].replace(/,/g, ''));
                if (!isNaN(value) && value > 0 && value < 1000000) {
                    console.log(`Found employees in table format: ${value}`);
                    return {
                        value: value,
                        source: 'Employee table'
                    };
                }
            }
        }
        
        // Look for employee numbers in notes section
        const notesPattern = /(?:note[s]?\s+(?:to|on)\s+(?:the\s+)?(?:financial\s+)?statements?|employees?)[\s\S]{0,500}?(?:average\s+)?(?:number\s+of\s+)?employees?[:\s]+([0-9,]+)/i;
        const match = textContent.match(notesPattern);
        
        if (match) {
            const value = parseInt(match[1].replace(/,/g, ''));
            if (!isNaN(value) && value > 0 && value < 1000000) {
                console.log(`Found employees in notes: ${value}`);
                return {
                    value: value,
                    source: 'Notes to accounts'
                };
            }
        }
        
        // Also look for the specific pattern in note 10
        const note10Pattern = /10\s*Average\s+number\s+of\s+employees[\s\S]{0,200}?average\s+number\s+of\s+employees\s+was\s+([0-9,]+)/i;
        const note10Match = textContent.match(note10Pattern);
        
        if (note10Match) {
            const value = parseInt(note10Match[1].replace(/,/g, ''));
            if (!isNaN(value) && value > 0 && value < 1000000) {
                console.log(`Found employees in note 10: ${value}`);
                return {
                    value: value,
                    source: 'Note 10 - Average number of employees'
                };
            }
        }
        
        return null;
    }
};

// Export
if (typeof window !== 'undefined') {
    window.EnhancedEmployeeParser = EnhancedEmployeeParser;
}