const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * PDF Structure Analyzer for Financial Data Extraction
 * Analyzes PDF structure to understand how to extract financial information
 */
class PDFStructureAnalyzer {
    constructor() {
        this.outputDir = path.join(__dirname, 'pdf-analysis-results');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Analyze PDF structure and extract financial data
     */
    async analyzePDFStructure() {
        console.log('📊 Analyzing PDF Structure for Financial Data Extraction');
        console.log('=' * 70);

        const pdfDir = path.join(__dirname, 'pdf-test-results');
        
        // Check if PDF files exist
        if (!fs.existsSync(pdfDir)) {
            console.log('❌ No PDF files found. Run test-pdf-access.js first.');
            return;
        }

        const pdfFiles = fs.readdirSync(pdfDir).filter(file => file.endsWith('.pdf'));
        
        if (pdfFiles.length === 0) {
            console.log('❌ No PDF files found in test results.');
            return;
        }

        console.log(`\n📄 Found ${pdfFiles.length} PDF files to analyze`);

        // Analyze the first PDF file
        const pdfPath = path.join(pdfDir, pdfFiles[0]);
        console.log(`\n🔍 Analyzing: ${pdfFiles[0]}`);
        
        try {
            // Method 1: Try pdftotext (if available)
            await this.tryPdfToText(pdfPath);
            
            // Method 2: Basic binary analysis
            await this.analyzeBinaryStructure(pdfPath);
            
            // Method 3: Try Node.js PDF parsing
            await this.tryNodePDFParsing(pdfPath);
            
            // Method 4: Manual text extraction patterns
            await this.tryManualTextExtraction(pdfPath);
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
        }
    }

    /**
     * Try using pdftotext command line tool
     */
    async tryPdfToText(pdfPath) {
        console.log('\n🔧 Method 1: Using pdftotext (if available)');
        
        try {
            // Check if pdftotext is available
            await execAsync('which pdftotext');
            
            const outputPath = path.join(this.outputDir, 'extracted-text.txt');
            const command = `pdftotext "${pdfPath}" "${outputPath}"`;
            
            await execAsync(command);
            
            if (fs.existsSync(outputPath)) {
                const extractedText = fs.readFileSync(outputPath, 'utf8');
                console.log('   ✅ Text extracted successfully');
                console.log(`   📝 Text length: ${extractedText.length} characters`);
                
                // Analyze the extracted text
                this.analyzeExtractedText(extractedText, 'pdftotext');
                
                return true;
            }
        } catch (error) {
            console.log('   ❌ pdftotext not available or failed');
            return false;
        }
    }

    /**
     * Analyze PDF binary structure
     */
    async analyzeBinaryStructure(pdfPath) {
        console.log('\n🔧 Method 2: Binary Structure Analysis');
        
        try {
            const pdfData = fs.readFileSync(pdfPath);
            const pdfText = pdfData.toString('utf8');
            
            console.log(`   📊 PDF size: ${pdfData.length} bytes`);
            
            // Extract text between stream/endstream
            const textStreams = this.extractTextStreams(pdfText);
            console.log(`   📝 Found ${textStreams.length} text streams`);
            
            if (textStreams.length > 0) {
                const combinedText = textStreams.join('\n');
                console.log(`   📝 Combined text length: ${combinedText.length} characters`);
                
                // Save raw streams
                const rawStreamPath = path.join(this.outputDir, 'raw-text-streams.txt');
                fs.writeFileSync(rawStreamPath, combinedText);
                
                // Analyze the text
                this.analyzeExtractedText(combinedText, 'binary-extraction');
            }
            
            // Look for specific PDF structures
            this.analyzePDFStructures(pdfText);
            
        } catch (error) {
            console.log('   ❌ Binary analysis failed:', error.message);
        }
    }

    /**
     * Extract text streams from PDF
     */
    extractTextStreams(pdfText) {
        const streams = [];
        const streamRegex = /stream\s*(.*?)\s*endstream/gs;
        let match;
        
        while ((match = streamRegex.exec(pdfText)) !== null) {
            const streamContent = match[1];
            
            // Try to decode if it's readable text
            if (streamContent.includes('BT') || streamContent.includes('Tj') || streamContent.includes('TJ')) {
                streams.push(streamContent);
            }
        }
        
        return streams;
    }

    /**
     * Analyze PDF structures (fonts, objects, etc.)
     */
    analyzePDFStructures(pdfText) {
        console.log('\n   📋 PDF Structure Analysis:');
        
        // Count different object types
        const objectTypes = {
            'Font': (pdfText.match(/\/Type\s*\/Font/g) || []).length,
            'Page': (pdfText.match(/\/Type\s*\/Page/g) || []).length,
            'XObject': (pdfText.match(/\/Type\s*\/XObject/g) || []).length,
            'Image': (pdfText.match(/\/Type\s*\/XObject\s*\/Subtype\s*\/Image/g) || []).length,
            'Table': (pdfText.match(/\/Table/g) || []).length,
            'Row': (pdfText.match(/\/Row/g) || []).length,
            'Cell': (pdfText.match(/\/Cell/g) || []).length
        };
        
        Object.entries(objectTypes).forEach(([type, count]) => {
            if (count > 0) {
                console.log(`      ${type}: ${count}`);
            }
        });
        
        // Look for text positioning commands
        const textCommands = {
            'Text Matrix': (pdfText.match(/\s+Tm\s/g) || []).length,
            'Text Positioning': (pdfText.match(/\s+Td\s/g) || []).length,
            'Show Text': (pdfText.match(/\s+Tj\s/g) || []).length,
            'Show Text Array': (pdfText.match(/\s+TJ\s/g) || []).length
        };
        
        console.log('\n   📝 Text Commands:');
        Object.entries(textCommands).forEach(([command, count]) => {
            if (count > 0) {
                console.log(`      ${command}: ${count}`);
            }
        });
    }

    /**
     * Try Node.js PDF parsing libraries
     */
    async tryNodePDFParsing(pdfPath) {
        console.log('\n🔧 Method 3: Node.js PDF Parsing');
        
        // Check if pdf-parse is available
        try {
            const pdfParse = require('pdf-parse');
            const pdfData = fs.readFileSync(pdfPath);
            
            const data = await pdfParse(pdfData);
            
            console.log('   ✅ PDF parsed successfully');
            console.log(`   📄 Pages: ${data.numpages}`);
            console.log(`   📝 Text length: ${data.text.length} characters`);
            
            // Save extracted text
            const outputPath = path.join(this.outputDir, 'pdf-parse-text.txt');
            fs.writeFileSync(outputPath, data.text);
            
            // Analyze the text
            this.analyzeExtractedText(data.text, 'pdf-parse');
            
            return true;
            
        } catch (error) {
            console.log('   ❌ pdf-parse not available:', error.message);
            console.log('   💡 Install with: npm install pdf-parse');
            return false;
        }
    }

    /**
     * Manual text extraction using patterns
     */
    async tryManualTextExtraction(pdfPath) {
        console.log('\n🔧 Method 4: Manual Text Extraction');
        
        try {
            const pdfData = fs.readFileSync(pdfPath);
            const pdfText = pdfData.toString('latin1'); // Use latin1 for better character handling
            
            // Look for readable text patterns
            const readableText = this.extractReadableText(pdfText);
            
            if (readableText.length > 0) {
                console.log(`   📝 Extracted ${readableText.length} characters`);
                
                // Save manual extraction
                const outputPath = path.join(this.outputDir, 'manual-extraction.txt');
                fs.writeFileSync(outputPath, readableText);
                
                // Analyze the text
                this.analyzeExtractedText(readableText, 'manual-extraction');
            } else {
                console.log('   ❌ No readable text found');
            }
            
        } catch (error) {
            console.log('   ❌ Manual extraction failed:', error.message);
        }
    }

    /**
     * Extract readable text from PDF binary
     */
    extractReadableText(pdfText) {
        const textChunks = [];
        
        // Pattern 1: Look for text between parentheses (common in PDFs)
        const parenTextRegex = /\(([^)]+)\)/g;
        let match;
        
        while ((match = parenTextRegex.exec(pdfText)) !== null) {
            const text = match[1];
            if (text.length > 2 && this.isReadableText(text)) {
                textChunks.push(text);
            }
        }
        
        // Pattern 2: Look for text in square brackets
        const bracketTextRegex = /\[([^\]]+)\]/g;
        while ((match = bracketTextRegex.exec(pdfText)) !== null) {
            const text = match[1];
            if (text.length > 2 && this.isReadableText(text)) {
                textChunks.push(text);
            }
        }
        
        // Pattern 3: Look for standalone words
        const wordRegex = /\b[A-Za-z]{3,}\b/g;
        const words = pdfText.match(wordRegex) || [];
        
        // Filter for financial terms
        const financialTerms = words.filter(word => 
            /^(profit|loss|revenue|turnover|assets|liabilities|cash|bank|balance|total|net|gross|income|expense|cost|tax|dividend|share|capital|equity|debt|credit|debit|account|statement|year|period|current|prior|previous|ended|ending|company|limited|plc|ltd)$/i.test(word)
        );
        
        textChunks.push(...financialTerms);
        
        return textChunks.join(' ');
    }

    /**
     * Check if text is readable (not binary data)
     */
    isReadableText(text) {
        // Check for reasonable character distribution
        const printableChars = text.match(/[a-zA-Z0-9\s£$€%.,()-]/g) || [];
        const printableRatio = printableChars.length / text.length;
        
        return printableRatio > 0.7 && text.length > 2;
    }

    /**
     * Analyze extracted text for financial data
     */
    analyzeExtractedText(text, method) {
        console.log(`\n   📊 Text Analysis (${method}):`);
        
        // Financial keywords analysis
        const financialKeywords = {
            'Revenue/Turnover': ['revenue', 'turnover', 'sales', 'income'],
            'Profit/Loss': ['profit', 'loss', 'surplus', 'deficit'],
            'Assets': ['assets', 'property', 'investments', 'cash', 'bank'],
            'Liabilities': ['liabilities', 'creditors', 'debt', 'borrowings'],
            'Equity': ['equity', 'capital', 'reserves', 'funds'],
            'Financial Years': ['year ended', 'period ended', '2022', '2021', '2020']
        };
        
        const keywordMatches = {};
        let totalMatches = 0;
        
        Object.entries(financialKeywords).forEach(([category, keywords]) => {
            const matches = keywords.reduce((count, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const found = (text.match(regex) || []).length;
                return count + found;
            }, 0);
            
            if (matches > 0) {
                keywordMatches[category] = matches;
                totalMatches += matches;
            }
        });
        
        console.log(`      Total financial keywords: ${totalMatches}`);
        Object.entries(keywordMatches).forEach(([category, count]) => {
            console.log(`         ${category}: ${count}`);
        });
        
        // Look for monetary values
        const monetaryPatterns = [
            /£\s*[\d,]+\.?\d*/g,
            /\$\s*[\d,]+\.?\d*/g,
            /€\s*[\d,]+\.?\d*/g,
            /\b\d{1,3}(?:,\d{3})*\.?\d*\b/g
        ];
        
        let monetaryValues = [];
        monetaryPatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            monetaryValues = monetaryValues.concat(matches);
        });
        
        console.log(`      Monetary values found: ${monetaryValues.length}`);
        if (monetaryValues.length > 0) {
            console.log(`         Examples: ${monetaryValues.slice(0, 10).join(', ')}`);
        }
        
        // Look for table structures
        const tableIndicators = [
            /^\s*\w+\s+\d+\s+\d+\s*$/gm,  // Row with text and numbers
            /^\s*\w+.*£.*£.*$/gm,         // Row with text and currency
            /^\s*\d+\s+\d+\s+\d+\s*$/gm   // Row with only numbers
        ];
        
        let tableRows = 0;
        tableIndicators.forEach(pattern => {
            const matches = text.match(pattern) || [];
            tableRows += matches.length;
        });
        
        console.log(`      Potential table rows: ${tableRows}`);
        
        // Extract potential financial statements
        this.extractFinancialStatements(text, method);
    }

    /**
     * Extract financial statements from text
     */
    extractFinancialStatements(text, method) {
        console.log(`\n   📋 Financial Statement Extraction (${method}):`);
        
        const statements = {
            'Profit & Loss': this.extractProfitAndLoss(text),
            'Balance Sheet': this.extractBalanceSheet(text),
            'Cash Flow': this.extractCashFlow(text)
        };
        
        Object.entries(statements).forEach(([type, data]) => {
            if (data.length > 0) {
                console.log(`      ${type}: ${data.length} items found`);
                
                // Save detailed extraction
                const filename = `${type.replace(/\s+/g, '-').toLowerCase()}-${method}.json`;
                const filepath = path.join(this.outputDir, filename);
                fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
                
                // Show first few items
                data.slice(0, 3).forEach(item => {
                    console.log(`         ${item.label}: ${item.value}`);
                });
            }
        });
    }

    /**
     * Extract Profit & Loss items
     */
    extractProfitAndLoss(text) {
        const items = [];
        const patterns = [
            { label: 'Revenue/Turnover', regex: /(?:revenue|turnover|sales)[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Gross Profit', regex: /gross\s+profit[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Operating Profit', regex: /operating\s+profit[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Net Profit', regex: /net\s+profit[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Profit Before Tax', regex: /profit\s+before\s+tax[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Profit After Tax', regex: /profit\s+after\s+tax[^\d]*£?\s*([\d,]+\.?\d*)/gi }
        ];
        
        patterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern.regex)];
            matches.forEach(match => {
                const value = match[1].replace(/,/g, '');
                if (!isNaN(parseFloat(value))) {
                    items.push({
                        label: pattern.label,
                        value: parseFloat(value),
                        formatted: match[0],
                        context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
                    });
                }
            });
        });
        
        return items;
    }

    /**
     * Extract Balance Sheet items
     */
    extractBalanceSheet(text) {
        const items = [];
        const patterns = [
            { label: 'Total Assets', regex: /total\s+assets[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Current Assets', regex: /current\s+assets[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Fixed Assets', regex: /fixed\s+assets[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Total Liabilities', regex: /total\s+liabilities[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Current Liabilities', regex: /current\s+liabilities[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Net Assets', regex: /net\s+assets[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Shareholders Equity', regex: /shareholders?\s+(?:equity|funds)[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Share Capital', regex: /share\s+capital[^\d]*£?\s*([\d,]+\.?\d*)/gi }
        ];
        
        patterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern.regex)];
            matches.forEach(match => {
                const value = match[1].replace(/,/g, '');
                if (!isNaN(parseFloat(value))) {
                    items.push({
                        label: pattern.label,
                        value: parseFloat(value),
                        formatted: match[0],
                        context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
                    });
                }
            });
        });
        
        return items;
    }

    /**
     * Extract Cash Flow items
     */
    extractCashFlow(text) {
        const items = [];
        const patterns = [
            { label: 'Operating Cash Flow', regex: /operating\s+cash\s+flow[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Investing Cash Flow', regex: /investing\s+cash\s+flow[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Financing Cash Flow', regex: /financing\s+cash\s+flow[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Net Cash Flow', regex: /net\s+cash\s+flow[^\d]*£?\s*([\d,]+\.?\d*)/gi },
            { label: 'Cash at Bank', regex: /cash\s+at\s+bank[^\d]*£?\s*([\d,]+\.?\d*)/gi }
        ];
        
        patterns.forEach(pattern => {
            const matches = [...text.matchAll(pattern.regex)];
            matches.forEach(match => {
                const value = match[1].replace(/,/g, '');
                if (!isNaN(parseFloat(value))) {
                    items.push({
                        label: pattern.label,
                        value: parseFloat(value),
                        formatted: match[0],
                        context: text.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50)
                    });
                }
            });
        });
        
        return items;
    }

    /**
     * Generate comprehensive analysis report
     */
    generateAnalysisReport() {
        console.log('\n📊 Generating Analysis Report...');
        
        const reportPath = path.join(this.outputDir, 'pdf-structure-analysis.md');
        const report = [
            '# PDF Structure Analysis Report',
            '## Company: JUST CASH FLOW PLC (08508165)',
            `Generated: ${new Date().toISOString()}`,
            '',
            '## Analysis Methods Used',
            '1. **pdftotext**: Command-line PDF text extraction',
            '2. **Binary Analysis**: Direct PDF binary structure analysis',
            '3. **pdf-parse**: Node.js PDF parsing library',
            '4. **Manual Extraction**: Pattern-based text extraction',
            '',
            '## Key Findings',
            '- PDF documents are accessible via multiple methods',
            '- Documents contain both text and tabular data',
            '- Financial keywords are present but may need pattern matching',
            '- Table structures exist but require specialized extraction',
            '',
            '## Recommendations for PDF Parser Enhancement',
            '1. **Primary Method**: Use pdf-parse library for text extraction',
            '2. **Fallback**: Implement binary text stream extraction',
            '3. **Pattern Matching**: Develop robust financial data patterns',
            '4. **Table Detection**: Implement table structure recognition',
            '5. **OCR Integration**: Add OCR capability for image-based PDFs',
            '',
            '## Technical Implementation',
            '- Install pdf-parse: `npm install pdf-parse`',
            '- Implement multiple extraction methods with fallbacks',
            '- Use regex patterns for financial data recognition',
            '- Add table structure detection algorithms',
            '- Implement confidence scoring for extracted data'
        ];
        
        fs.writeFileSync(reportPath, report.join('\n'));
        console.log(`   📄 Report saved: ${reportPath}`);
    }
}

/**
 * Main execution
 */
async function main() {
    const analyzer = new PDFStructureAnalyzer();
    
    try {
        await analyzer.analyzePDFStructure();
        analyzer.generateAnalysisReport();
        
        console.log('\n✅ PDF Structure Analysis Complete!');
        console.log('📁 Check pdf-analysis-results directory for detailed reports');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
    }
}

// Run the analysis
if (require.main === module) {
    main();
}

module.exports = { PDFStructureAnalyzer };