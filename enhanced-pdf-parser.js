/**
 * Enhanced PDF Parser for Companies House Accounts
 * Extracts financial data from PDF documents when iXBRL is not available
 */

const EnhancedPDFParser = {
    /**
     * Parse PDF text content and extract financial metrics
     * @param {string} pdfText - Raw text extracted from PDF
     * @param {Object} filing - Filing metadata
     * @returns {Object} Structured financial data
     */
    parsePDFText(pdfText, filing) {
        console.log('📄 Enhanced PDF Parser: Starting PDF text analysis...');
        console.log('📄 Text length:', pdfText.length, 'characters');
        
        if (!pdfText || pdfText.length < 100) {
            console.log('📄 Insufficient PDF text content for parsing');
            return null;
        }
        
        const data = {
            source: 'PDF',
            filing: filing,
            extractedData: {},
            confidence: {
                overall: 0,
                metrics: {}
            }
        };
        
        // Financial patterns for UK companies
        const patterns = this.getFinancialPatterns();
        
        // Extract each financial metric
        Object.entries(patterns).forEach(([metric, patternList]) => {
            const result = this.extractMetric(pdfText, metric, patternList);
            if (result.found) {
                data.extractedData[metric] = result;
                data.confidence.metrics[metric] = result.confidence;
                console.log(`📄 Found ${metric}: ${result.formatted} (confidence: ${result.confidence})`);
            }
        });
        
        // Calculate overall confidence
        const confidenceValues = Object.values(data.confidence.metrics);
        data.confidence.overall = confidenceValues.length > 0 
            ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length 
            : 0;
        
        console.log(`📄 PDF parsing complete. Overall confidence: ${data.confidence.overall.toFixed(2)}`);
        
        return data.confidence.overall > 0.3 ? data : null;
    },
    
    /**
     * Define financial data extraction patterns
     */
    getFinancialPatterns() {
        return {
            revenue: [
                /turnover[:\s]+£?([0-9,]+)/gi,
                /revenue[:\s]+£?([0-9,]+)/gi,
                /sales[:\s]+£?([0-9,]+)/gi,
                /gross\s+revenue[:\s]+£?([0-9,]+)/gi,
                /total\s+revenue[:\s]+£?([0-9,]+)/gi
            ],
            netProfit: [
                /profit\s+(?:after|for\s+the)\s+(?:tax|period|year)[:\s]+£?([0-9,\-\(\)]+)/gi,
                /net\s+profit[:\s]+£?([0-9,\-\(\)]+)/gi,
                /profit\s+for\s+financial\s+year[:\s]+£?([0-9,\-\(\)]+)/gi,
                /(?:loss|profit)\s+for\s+the\s+period[:\s]+£?([0-9,\-\(\)]+)/gi
            ],
            totalAssets: [
                /total\s+assets[:\s]+£?([0-9,]+)/gi,
                /balance\s+sheet\s+total[:\s]+£?([0-9,]+)/gi,
                /net\s+assets[:\s]+£?([0-9,]+)/gi,
                /total\s+assets\s+less\s+current\s+liabilities[:\s]+£?([0-9,]+)/gi
            ],
            currentAssets: [
                /current\s+assets[:\s]+£?([0-9,]+)/gi,
                /debtors[:\s]+£?([0-9,]+)/gi,
                /stocks?[:\s]+£?([0-9,]+)/gi
            ],
            cash: [
                /cash\s+at\s+bank[:\s]+£?([0-9,]+)/gi,
                /cash\s+in\s+hand[:\s]+£?([0-9,]+)/gi,
                /cash\s+and\s+cash\s+equivalents[:\s]+£?([0-9,]+)/gi,
                /bank\s+balance[:\s]+£?([0-9,]+)/gi
            ],
            totalLiabilities: [
                /total\s+liabilities[:\s]+£?([0-9,]+)/gi,
                /creditors[:\s]+£?([0-9,]+)/gi,
                /current\s+liabilities[:\s]+£?([0-9,]+)/gi
            ],
            employees: [
                /number\s+of\s+employees[:\s]+([0-9]+)/gi,
                /average\s+number\s+of\s+employees[:\s]+([0-9]+)/gi,
                /staff\s+numbers?[:\s]+([0-9]+)/gi,
                /employees?\s+during\s+(?:the\s+)?period[:\s]+([0-9]+)/gi
            ]
        };
    },
    
    /**
     * Extract a specific metric using multiple patterns
     */
    extractMetric(text, metricName, patterns) {
        let bestMatch = null;
        let highestConfidence = 0;
        
        patterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern)];
            
            matches.forEach(match => {
                const rawValue = match[1];
                const numericValue = this.parseNumericValue(rawValue, metricName);
                
                if (numericValue !== null) {
                    // Calculate confidence based on context and value reasonableness
                    const confidence = this.calculateConfidence(match, metricName, numericValue);
                    
                    if (confidence > highestConfidence) {
                        highestConfidence = confidence;
                        bestMatch = {
                            found: true,
                            value: numericValue,
                            formatted: this.formatValue(numericValue, metricName),
                            raw: rawValue,
                            pattern: pattern.source,
                            context: this.getContext(text, match.index, 100),
                            confidence: confidence
                        };
                    }
                }
            });
        });
        
        return bestMatch || { found: false, confidence: 0 };
    },
    
    /**
     * Parse numeric value from text, handling currency and formatting
     */
    parseNumericValue(text, metricName) {
        if (!text) return null;
        
        // Handle negative values in parentheses
        const isNegative = text.includes('(') && text.includes(')');
        
        // Clean the text
        let cleaned = text.replace(/[£$€,\s\(\)]/g, '');
        
        // Handle dashes or nil values
        if (cleaned === '-' || cleaned === 'nil' || cleaned === '') {
            return 0;
        }
        
        const value = parseFloat(cleaned);
        if (isNaN(value)) return null;
        
        // Apply negative if needed
        return isNegative ? -Math.abs(value) : value;
    },
    
    /**
     * Calculate confidence score for extracted value
     */
    calculateConfidence(match, metricName, value) {
        let confidence = 0.5; // Base confidence
        
        // Context analysis
        const context = match[0].toLowerCase();
        
        // Boost confidence for specific patterns
        if (context.includes('total') || context.includes('net')) confidence += 0.2;
        if (context.includes('£')) confidence += 0.1;
        if (context.includes(':')) confidence += 0.1;
        
        // Value reasonableness checks
        if (metricName === 'employees') {
            if (value >= 1 && value <= 10000) confidence += 0.2;
            if (value > 10000) confidence -= 0.2;
        } else {
            // Financial values
            if (value > 0 && value < 1000000000) confidence += 0.1;
            if (value > 1000000000) confidence -= 0.1; // Very large values less likely in PDF text
        }
        
        return Math.min(1.0, confidence);
    },
    
    /**
     * Get surrounding context for a match
     */
    getContext(text, index, length) {
        const start = Math.max(0, index - length);
        const end = Math.min(text.length, index + length);
        return text.substring(start, end).trim();
    },
    
    /**
     * Format value for display
     */
    formatValue(value, metricName) {
        if (metricName === 'employees') {
            return value.toLocaleString();
        } else {
            // Financial values in thousands if > 1000
            if (Math.abs(value) >= 1000000) {
                return `£${(value / 1000000).toFixed(1)}M`;
            } else if (Math.abs(value) >= 1000) {
                return `£${(value / 1000).toFixed(0)}K`;
            } else {
                return `£${value.toLocaleString()}`;
            }
        }
    },
    
    /**
     * Convert PDF extraction result to finance parser format
     */
    convertToFinanceFormat(pdfData) {
        if (!pdfData || !pdfData.extractedData) return null;
        
        const metrics = {};
        
        // Convert each extracted metric to the expected format
        Object.entries(pdfData.extractedData).forEach(([key, data]) => {
            metrics[key] = {
                value: data.value,
                formatted: data.formatted,
                source: 'PDF',
                confidence: data.confidence,
                scale: '0' // PDF values are already scaled
            };
        });
        
        return {
            metrics: metrics,
            source: 'PDF',
            confidence: pdfData.confidence.overall,
            filing: pdfData.filing
        };
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedPDFParser;
}

if (typeof window !== 'undefined') {
    window.EnhancedPDFParser = EnhancedPDFParser;
}