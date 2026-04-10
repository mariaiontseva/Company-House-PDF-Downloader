# Enhanced PDF Parser Integration Guide

## Overview

This guide shows how to integrate the enhanced PDF parser into the existing finance parser to provide fallback PDF parsing when iXBRL is not available.

## Integration Points

### 1. Update finance-parser.js

Add the enhanced PDF parser as a fallback when iXBRL extraction fails:

```javascript
// Add at the top of finance-parser.js
const EnhancedPDFParser = require('./enhanced-pdf-parser');

// Modify the downloadAndParseXBRL method
async downloadAndParseXBRL(filing) {
    console.log('🔸 FinanceParser: downloadAndParseXBRL called with filing:', filing);
    
    try {
        // Existing iXBRL extraction logic...
        const xbrlData = await this.tryiXBRLExtraction(filing);
        
        if (xbrlData && Object.keys(xbrlData).length > 0) {
            return xbrlData;
        }
    } catch (error) {
        console.log('🔸 FinanceParser: iXBRL extraction failed:', error.message);
    }
    
    // NEW: Fallback to enhanced PDF parser
    console.log('🔸 FinanceParser: Falling back to PDF parsing...');
    try {
        const pdfResult = await EnhancedPDFParser.extractFinancialDataFromPDF(
            this.extractCompanyNumber(filing),
            filing
        );
        
        if (pdfResult.financialData && pdfResult.confidence > 20) {
            console.log(`🔸 FinanceParser: PDF extraction successful (${pdfResult.confidence}% confidence)`);
            
            // Convert PDF parser format to existing format
            return this.convertPDFDataToXBRLFormat(pdfResult.financialData);
        }
    } catch (pdfError) {
        console.log('🔸 FinanceParser: PDF extraction also failed:', pdfError.message);
    }
    
    // Return empty if all methods fail
    return {};
}
```

### 2. Add Format Conversion

Add a method to convert PDF parser output to the expected iXBRL format:

```javascript
// Add to FinanceParser object
convertPDFDataToXBRLFormat(pdfData) {
    const xbrlFormat = {};
    
    // Map PDF parser output to XBRL-style tags
    const mappings = {
        'revenue': 'uk-gaap:TurnoverRevenue',
        'profit': 'uk-gaap:ProfitLossForPeriod',
        'totalAssets': 'uk-gaap:TotalAssetsLessCurrentLiabilities',
        'netAssets': 'uk-gaap:NetAssetsLiabilities',
        'cash': 'uk-gaap:CashBankInHand',
        'employees': 'uk-gaap:AverageNumberEmployeesDuringPeriod',
        'shareholdersEquity': 'uk-gaap:ShareholdersFunds'
    };
    
    Object.entries(mappings).forEach(([pdfKey, xbrlKey]) => {
        if (pdfData[pdfKey] && pdfData[pdfKey].value !== null) {
            xbrlFormat[xbrlKey] = {
                current: {
                    value: pdfData[pdfKey].value,
                    formatted: pdfData[pdfKey].formatted || this.formatCurrency(pdfData[pdfKey].value),
                    source: 'pdf-extraction'
                }
            };
        }
    });
    
    return xbrlFormat;
},

extractCompanyNumber(filing) {
    // Extract company number from filing links
    if (filing.links && filing.links.self) {
        const parts = filing.links.self.split('/');
        return parts[2]; // Company number is typically the 3rd part
    }
    return null;
}
```

### 3. Update extractMetrics Method

Enhance the extractMetrics method to handle PDF-sourced data:

```javascript
// In extractMetrics method, add after existing logic:
extractMetrics(xbrlData) {
    const metrics = {};
    
    // Existing iXBRL extraction logic...
    for (const [metricName, tags] of Object.entries(this.xbrlTags)) {
        // ... existing code ...
    }
    
    // NEW: Handle PDF-sourced data
    Object.keys(xbrlData).forEach(key => {
        if (xbrlData[key] && xbrlData[key].current && xbrlData[key].current.source === 'pdf-extraction') {
            console.log(`🔸 FinanceParser: Using PDF-extracted data for ${key}`);
            
            // Map XBRL key back to metric name
            const metricName = this.getMetricNameFromXBRLKey(key);
            if (metricName && !metrics[metricName]) {
                metrics[metricName] = xbrlData[key].current;
                metrics[metricName].extractionMethod = 'pdf';
            }
        }
    });
    
    return metrics;
},

getMetricNameFromXBRLKey(xbrlKey) {
    const reverseMapping = {
        'uk-gaap:TurnoverRevenue': 'revenue',
        'uk-gaap:ProfitLossForPeriod': 'netProfit',
        'uk-gaap:TotalAssetsLessCurrentLiabilities': 'totalAssets',
        'uk-gaap:NetAssetsLiabilities': 'netAssets',
        'uk-gaap:CashBankInHand': 'cashAndEquivalents',
        'uk-gaap:AverageNumberEmployeesDuringPeriod': 'employees',
        'uk-gaap:ShareholdersFunds': 'shareholdersEquity'
    };
    
    return reverseMapping[xbrlKey];
}
```

### 4. Update UI to Show Data Source

Modify the UI components to indicate when data comes from PDF parsing:

```javascript
// In the display logic, add source indicators:
function displayFinancialData(financialHistory) {
    financialHistory.forEach(filing => {
        Object.entries(filing.metrics).forEach(([metric, data]) => {
            if (data.extractionMethod === 'pdf') {
                // Add visual indicator for PDF-sourced data
                addPDFSourceIndicator(metric, data);
            }
        });
    });
}

function addPDFSourceIndicator(metric, data) {
    // Add a small icon or label to indicate PDF source
    // Could show confidence level or suggest verification
    console.log(`📄 ${metric}: ${data.formatted} (PDF-extracted)`);
}
```

### 5. Add Configuration Options

Add configuration options to control PDF parsing behavior:

```javascript
// Add to FinanceParser configuration
const FinanceParser = {
    // Existing configuration...
    
    // NEW: PDF parsing configuration
    pdfConfig: {
        enabled: true,
        minimumConfidence: 20,
        fallbackToOCR: false, // Future OCR integration
        maxFileSizeMB: 50,
        timeoutMs: 30000
    },
    
    // Update the main extraction method
    async extractFinancialData(companyNumber) {
        // Existing logic...
        
        for (let i = 0; i < allFilings.length; i++) {
            const filing = allFilings[i];
            
            try {
                let xbrlData = await this.downloadAndParseXBRL(filing);
                
                if (xbrlData && Object.keys(xbrlData).length > 0) {
                    const metrics = this.extractMetrics(xbrlData);
                    
                    // NEW: Add extraction metadata
                    const extractionMeta = this.getExtractionMetadata(metrics);
                    
                    const filingData = {
                        date: filing.date,
                        year: year,
                        description: filing.description,
                        type: filing.type,
                        metrics: metrics,
                        ratios: this.calculateRatios(xbrlData),
                        isDormant: isDormant,
                        extractionMeta: extractionMeta // NEW
                    };
                    
                    financialHistory.push(filingData);
                }
            } catch (error) {
                console.log(`🔸 FinanceParser: Error processing filing ${i + 1}:`, error.message);
            }
        }
        
        return {
            companyNumber: companyNumber,
            latestFiling: financialHistory[0] || null,
            historicalData: financialHistory,
            insights: insights,
            totalFilings: allFilings.length,
            filingsWithData: financialHistory.length,
            pdfParsingEnabled: this.pdfConfig.enabled // NEW
        };
    },
    
    getExtractionMetadata(metrics) {
        const pdfExtracted = Object.values(metrics).filter(m => m.extractionMethod === 'pdf').length;
        const iXBRLExtracted = Object.values(metrics).filter(m => !m.extractionMethod || m.extractionMethod === 'ixbrl').length;
        
        return {
            totalMetrics: Object.keys(metrics).length,
            pdfExtracted: pdfExtracted,
            iXBRLExtracted: iXBRLExtracted,
            primarySource: pdfExtracted > iXBRLExtracted ? 'pdf' : 'ixbrl'
        };
    }
};
```

### 6. Error Handling and Logging

Add comprehensive error handling:

```javascript
// Add to FinanceParser
async downloadAndParseXBRL(filing) {
    const startTime = Date.now();
    let extractionMethod = 'unknown';
    
    try {
        // Try iXBRL first
        extractionMethod = 'ixbrl';
        const xbrlData = await this.tryiXBRLExtraction(filing);
        
        if (xbrlData && Object.keys(xbrlData).length > 0) {
            this.logExtraction('success', extractionMethod, Date.now() - startTime);
            return xbrlData;
        }
    } catch (error) {
        this.logExtraction('failed', extractionMethod, Date.now() - startTime, error.message);
    }
    
    // Try PDF parsing
    if (this.pdfConfig.enabled) {
        try {
            extractionMethod = 'pdf';
            const pdfResult = await EnhancedPDFParser.extractFinancialDataFromPDF(
                this.extractCompanyNumber(filing),
                filing
            );
            
            if (pdfResult.confidence >= this.pdfConfig.minimumConfidence) {
                this.logExtraction('success', extractionMethod, Date.now() - startTime, null, pdfResult.confidence);
                return this.convertPDFDataToXBRLFormat(pdfResult.financialData);
            } else {
                this.logExtraction('low-confidence', extractionMethod, Date.now() - startTime, null, pdfResult.confidence);
            }
        } catch (error) {
            this.logExtraction('failed', extractionMethod, Date.now() - startTime, error.message);
        }
    }
    
    this.logExtraction('no-data', 'all-methods', Date.now() - startTime);
    return {};
},

logExtraction(status, method, duration, error = null, confidence = null) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        status,
        method,
        duration,
        error,
        confidence
    };
    
    console.log(`🔸 FinanceParser: Extraction ${status} (${method}) in ${duration}ms` + 
               (confidence ? ` with ${confidence}% confidence` : ''));
    
    // Could save to analytics/monitoring system
}
```

## Testing the Integration

### Test Script

```javascript
// test-integration.js
const FinanceParser = require('./finance-parser');

async function testIntegration() {
    console.log('🧪 Testing Enhanced PDF Parser Integration');
    
    // Test with PDF-only company
    const pdfOnlyCompany = '08508165';
    
    // Test with iXBRL company for comparison
    const ixbrlCompany = '00000001'; // Replace with known iXBRL company
    
    const testResults = await Promise.all([
        FinanceParser.extractFinancialData(pdfOnlyCompany),
        FinanceParser.extractFinancialData(ixbrlCompany)
    ]);
    
    console.log('PDF-only company results:', testResults[0]);
    console.log('iXBRL company results:', testResults[1]);
}

testIntegration();
```

## Deployment Checklist

- [ ] Install pdf-parse dependency: `npm install pdf-parse`
- [ ] Add enhanced-pdf-parser.js to project
- [ ] Update finance-parser.js with integration code
- [ ] Test with PDF-only companies
- [ ] Test with iXBRL companies (ensure no regression)
- [ ] Update UI to show data source indicators
- [ ] Add monitoring for PDF parsing success rates
- [ ] Update documentation for new capabilities
- [ ] Consider rate limiting for PDF processing
- [ ] Plan OCR integration for future enhancement

## Performance Considerations

- PDF parsing is more resource-intensive than iXBRL
- Consider caching PDF extraction results
- Implement timeouts for large PDF files
- Monitor memory usage during PDF processing
- Consider background processing for large documents

## Future Enhancements

1. **OCR Integration**: Add Tesseract.js or cloud OCR
2. **Machine Learning**: Train models for financial document understanding
3. **Validation Systems**: Cross-validate extracted data
4. **Performance Optimization**: Optimize for large-scale processing
5. **User Feedback**: Allow users to correct/verify PDF-extracted data