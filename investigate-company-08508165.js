const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Companies House API configuration
const CH_API_KEY = '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';
const TARGET_COMPANY = '08508165'; // JUST CASH FLOW PLC

/**
 * Investigation script for company 08508165 (JUST CASH FLOW PLC)
 * Purpose: Understand accounts filings structure and PDF accessibility for parsing
 */

class CompanyInvestigator {
    constructor(companyNumber, apiKey) {
        this.companyNumber = companyNumber;
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.companieshouse.gov.uk';
        
        // Create output directory for investigation results
        this.outputDir = path.join(__dirname, 'investigation-results');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    
    /**
     * Main investigation method
     */
    async investigate() {
        console.log(`🔍 Starting investigation of company ${this.companyNumber} (JUST CASH FLOW PLC)`);
        console.log('=' * 80);
        
        const results = {
            companyNumber: this.companyNumber,
            companyName: 'JUST CASH FLOW PLC',
            timestamp: new Date().toISOString(),
            companyProfile: null,
            filingHistory: null,
            accountsFilings: [],
            documentMetadata: [],
            pdfDocuments: [],
            insights: {},
            errors: []
        };
        
        try {
            // Step 1: Get company profile
            console.log('\n📋 Step 1: Getting company profile...');
            results.companyProfile = await this.getCompanyProfile();
            
            // Step 2: Get complete filing history
            console.log('\n📁 Step 2: Getting complete filing history...');
            results.filingHistory = await this.getFilingHistory();
            
            // Step 3: Focus on accounts filings
            console.log('\n📊 Step 3: Analyzing accounts filings...');
            results.accountsFilings = await this.analyzeAccountsFilings(results.filingHistory);
            
            // Step 4: Get document metadata for each accounts filing
            console.log('\n📄 Step 4: Getting document metadata...');
            results.documentMetadata = await this.getDocumentMetadata(results.accountsFilings);
            
            // Step 5: Analyze document formats and accessibility
            console.log('\n🔍 Step 5: Analyzing document formats...');
            results.insights = await this.analyzeDocumentFormats(results.documentMetadata);
            
            // Step 6: Try to access PDF documents
            console.log('\n📋 Step 6: Testing PDF document access...');
            results.pdfDocuments = await this.testPdfAccess(results.documentMetadata);
            
            // Step 7: Generate comprehensive report
            console.log('\n📊 Step 7: Generating investigation report...');
            await this.generateReport(results);
            
            console.log('\n✅ Investigation completed successfully!');
            console.log(`📄 Report saved to: ${path.join(this.outputDir, 'investigation-report.json')}`);
            
        } catch (error) {
            console.error('❌ Investigation failed:', error.message);
            results.errors.push({
                step: 'main',
                error: error.message,
                stack: error.stack
            });
        }
        
        return results;
    }
    
    /**
     * Get company profile information
     */
    async getCompanyProfile() {
        try {
            const response = await axios.get(`${this.baseUrl}/company/${this.companyNumber}`, {
                auth: { username: this.apiKey, password: '' }
            });
            
            const profile = response.data;
            console.log(`   Company Name: ${profile.company_name}`);
            console.log(`   Company Status: ${profile.company_status}`);
            console.log(`   Company Type: ${profile.type}`);
            console.log(`   Incorporation Date: ${profile.date_of_creation}`);
            console.log(`   SIC Codes: ${profile.sic_codes?.join(', ') || 'None'}`);
            
            return profile;
            
        } catch (error) {
            console.error('   ❌ Error getting company profile:', error.message);
            throw error;
        }
    }
    
    /**
     * Get complete filing history with focus on accounts
     */
    async getFilingHistory() {
        try {
            const response = await axios.get(`${this.baseUrl}/company/${this.companyNumber}/filing-history`, {
                auth: { username: this.apiKey, password: '' },
                params: {
                    items_per_page: 100,
                    category: 'accounts'
                }
            });
            
            const filings = response.data;
            console.log(`   Total accounts filings: ${filings.total_count}`);
            console.log(`   Items returned: ${filings.items.length}`);
            
            return filings;
            
        } catch (error) {
            console.error('   ❌ Error getting filing history:', error.message);
            throw error;
        }
    }
    
    /**
     * Analyze accounts filings in detail
     */
    async analyzeAccountsFilings(filingHistory) {
        const accountsFilings = [];
        
        if (!filingHistory || !filingHistory.items) {
            console.log('   ⚠️  No filing history available');
            return accountsFilings;
        }
        
        filingHistory.items.forEach((filing, index) => {
            if (filing.category === 'accounts') {
                console.log(`\n   📄 Filing ${index + 1}:`);
                console.log(`      Date: ${filing.date}`);
                console.log(`      Description: ${filing.description}`);
                console.log(`      Type: ${filing.type}`);
                console.log(`      Transaction ID: ${filing.transaction_id}`);
                console.log(`      Paper Filed: ${filing.paper_filed || false}`);
                console.log(`      Has Document Metadata: ${!!(filing.links && filing.links.document_metadata)}`);
                
                // Check for associated filings
                if (filing.associated_filings && filing.associated_filings.length > 0) {
                    console.log(`      Associated Filings: ${filing.associated_filings.length}`);
                    filing.associated_filings.forEach((af, afIndex) => {
                        console.log(`         ${afIndex + 1}. ${af.description} (${af.type})`);
                    });
                }
                
                accountsFilings.push({
                    ...filing,
                    index: index + 1,
                    hasDocumentMetadata: !!(filing.links && filing.links.document_metadata)
                });
            }
        });
        
        console.log(`\n   📊 Summary: ${accountsFilings.length} accounts filings found`);
        return accountsFilings;
    }
    
    /**
     * Get document metadata for each accounts filing
     */
    async getDocumentMetadata(accountsFilings) {
        const metadata = [];
        
        for (const filing of accountsFilings) {
            if (!filing.hasDocumentMetadata) {
                console.log(`   ⚠️  No document metadata for filing ${filing.index}`);
                continue;
            }
            
            try {
                console.log(`\n   📄 Getting metadata for filing ${filing.index} (${filing.date})...`);
                
                const response = await axios.get(filing.links.document_metadata, {
                    auth: { username: this.apiKey, password: '' }
                });
                
                const docMetadata = response.data;
                console.log(`      Document ID: ${docMetadata.id}`);
                console.log(`      Description: ${docMetadata.description}`);
                console.log(`      Created: ${docMetadata.created_at}`);
                console.log(`      Size: ${docMetadata.size} bytes`);
                
                if (docMetadata.resources) {
                    console.log('      Available formats:');
                    Object.entries(docMetadata.resources).forEach(([format, resource]) => {
                        console.log(`         ${format}: ${resource.content_length} bytes`);
                    });
                }
                
                metadata.push({
                    filing: filing,
                    metadata: docMetadata
                });
                
            } catch (error) {
                console.error(`   ❌ Error getting metadata for filing ${filing.index}:`, error.message);
                metadata.push({
                    filing: filing,
                    error: error.message
                });
            }
        }
        
        return metadata;
    }
    
    /**
     * Analyze document formats and their characteristics
     */
    async analyzeDocumentFormats(documentMetadata) {
        const insights = {
            totalDocuments: documentMetadata.length,
            formatDistribution: {},
            documentSizes: {},
            availableFormats: new Set(),
            pdfDocuments: [],
            ixbrlDocuments: [],
            xmlDocuments: [],
            recommendations: []
        };
        
        console.log('\n   📊 Document Format Analysis:');
        
        documentMetadata.forEach(doc => {
            if (doc.error) {
                console.log(`      ❌ Error for ${doc.filing.date}: ${doc.error}`);
                return;
            }
            
            const metadata = doc.metadata;
            console.log(`\n      📄 Document: ${metadata.description} (${doc.filing.date})`);
            
            if (metadata.resources) {
                Object.entries(metadata.resources).forEach(([format, resource]) => {
                    insights.availableFormats.add(format);
                    
                    if (!insights.formatDistribution[format]) {
                        insights.formatDistribution[format] = 0;
                    }
                    insights.formatDistribution[format]++;
                    
                    if (!insights.documentSizes[format]) {
                        insights.documentSizes[format] = [];
                    }
                    insights.documentSizes[format].push(resource.content_length);
                    
                    console.log(`         ${format}: ${resource.content_length} bytes`);
                    
                    // Categorize by format
                    if (format === 'application/pdf') {
                        insights.pdfDocuments.push({
                            filing: doc.filing,
                            metadata: metadata,
                            resource: resource
                        });
                    } else if (format === 'application/xhtml+xml') {
                        insights.ixbrlDocuments.push({
                            filing: doc.filing,
                            metadata: metadata,
                            resource: resource
                        });
                    } else if (format === 'application/xml') {
                        insights.xmlDocuments.push({
                            filing: doc.filing,
                            metadata: metadata,
                            resource: resource
                        });
                    }
                });
            }
        });
        
        // Generate insights
        console.log('\n   🔍 Analysis Summary:');
        console.log(`      Total documents analyzed: ${insights.totalDocuments}`);
        console.log(`      Available formats: ${Array.from(insights.availableFormats).join(', ')}`);
        console.log(`      PDF documents: ${insights.pdfDocuments.length}`);
        console.log(`      iXBRL documents: ${insights.ixbrlDocuments.length}`);
        console.log(`      XML documents: ${insights.xmlDocuments.length}`);
        
        // Generate recommendations
        if (insights.pdfDocuments.length > 0) {
            insights.recommendations.push('PDF documents are available and can be used for fallback parsing when iXBRL is not available');
        }
        
        if (insights.ixbrlDocuments.length > 0) {
            insights.recommendations.push('iXBRL documents are available and should be the primary source for financial data extraction');
        }
        
        if (insights.pdfDocuments.length > insights.ixbrlDocuments.length) {
            insights.recommendations.push('More PDF documents than iXBRL - PDF parsing capability is essential');
        }
        
        return insights;
    }
    
    /**
     * Test PDF document access and analyze structure
     */
    async testPdfAccess(documentMetadata) {
        const pdfResults = [];
        
        console.log('\n   📋 Testing PDF Document Access:');
        
        // Find PDF documents
        const pdfDocs = documentMetadata.filter(doc => 
            doc.metadata && doc.metadata.resources && doc.metadata.resources['application/pdf']
        );
        
        if (pdfDocs.length === 0) {
            console.log('      ⚠️  No PDF documents found');
            return pdfResults;
        }
        
        console.log(`      Found ${pdfDocs.length} PDF documents`);
        
        // Test access to the first few PDF documents
        const testCount = Math.min(3, pdfDocs.length);
        
        for (let i = 0; i < testCount; i++) {
            const doc = pdfDocs[i];
            const pdfResource = doc.metadata.resources['application/pdf'];
            
            try {
                console.log(`\n      🔍 Testing PDF ${i + 1}: ${doc.filing.date}`);
                console.log(`         Size: ${pdfResource.content_length} bytes`);
                
                // Try to access the document
                const documentUrl = doc.metadata.links.document;
                console.log(`         Document URL: ${documentUrl}`);
                
                // Test different access methods
                const accessMethods = [
                    { name: 'Direct API access', url: documentUrl },
                    { name: 'Content endpoint', url: `${documentUrl}/content` },
                    { name: 'With PDF format', url: `${documentUrl}?format=pdf` }
                ];
                
                const testResult = {
                    filing: doc.filing,
                    metadata: doc.metadata,
                    resource: pdfResource,
                    accessTests: []
                };
                
                for (const method of accessMethods) {
                    try {
                        console.log(`         Testing: ${method.name}`);
                        
                        const response = await axios.head(method.url, {
                            auth: { username: this.apiKey, password: '' }
                        });
                        
                        testResult.accessTests.push({
                            method: method.name,
                            url: method.url,
                            status: response.status,
                            contentType: response.headers['content-type'],
                            contentLength: response.headers['content-length'],
                            success: true
                        });
                        
                        console.log(`            ✅ ${response.status} - ${response.headers['content-type']}`);
                        
                    } catch (error) {
                        testResult.accessTests.push({
                            method: method.name,
                            url: method.url,
                            error: error.message,
                            success: false
                        });
                        
                        console.log(`            ❌ ${error.message}`);
                    }
                }
                
                pdfResults.push(testResult);
                
            } catch (error) {
                console.error(`      ❌ Error testing PDF ${i + 1}:`, error.message);
                pdfResults.push({
                    filing: doc.filing,
                    error: error.message
                });
            }
        }
        
        return pdfResults;
    }
    
    /**
     * Generate comprehensive investigation report
     */
    async generateReport(results) {
        const reportPath = path.join(this.outputDir, 'investigation-report.json');
        const summaryPath = path.join(this.outputDir, 'investigation-summary.md');
        
        // Save full JSON report
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        
        // Generate markdown summary
        const summary = this.generateMarkdownSummary(results);
        fs.writeFileSync(summaryPath, summary);
        
        console.log(`   📄 Full report: ${reportPath}`);
        console.log(`   📝 Summary: ${summaryPath}`);
    }
    
    /**
     * Generate markdown summary of investigation
     */
    generateMarkdownSummary(results) {
        const md = [];
        
        md.push('# Company Investigation Report');
        md.push(`## Company: ${results.companyName} (${results.companyNumber})`);
        md.push(`Generated: ${results.timestamp}`);
        md.push('');
        
        // Company Profile
        if (results.companyProfile) {
            md.push('## Company Profile');
            md.push(`- **Status**: ${results.companyProfile.company_status}`);
            md.push(`- **Type**: ${results.companyProfile.type}`);
            md.push(`- **Incorporation Date**: ${results.companyProfile.date_of_creation}`);
            md.push(`- **SIC Codes**: ${results.companyProfile.sic_codes?.join(', ') || 'None'}`);
            md.push('');
        }
        
        // Filing History
        if (results.filingHistory) {
            md.push('## Filing History');
            md.push(`- **Total Accounts Filings**: ${results.filingHistory.total_count}`);
            md.push(`- **Items Analyzed**: ${results.accountsFilings.length}`);
            md.push('');
        }
        
        // Document Analysis
        if (results.insights) {
            md.push('## Document Format Analysis');
            md.push(`- **Total Documents**: ${results.insights.totalDocuments}`);
            md.push(`- **Available Formats**: ${Array.from(results.insights.availableFormats).join(', ')}`);
            md.push(`- **PDF Documents**: ${results.insights.pdfDocuments.length}`);
            md.push(`- **iXBRL Documents**: ${results.insights.ixbrlDocuments.length}`);
            md.push(`- **XML Documents**: ${results.insights.xmlDocuments.length}`);
            md.push('');
            
            if (results.insights.recommendations.length > 0) {
                md.push('### Recommendations');
                results.insights.recommendations.forEach(rec => {
                    md.push(`- ${rec}`);
                });
                md.push('');
            }
        }
        
        // PDF Access Tests
        if (results.pdfDocuments.length > 0) {
            md.push('## PDF Access Test Results');
            results.pdfDocuments.forEach((pdf, index) => {
                if (pdf.error) {
                    md.push(`### Document ${index + 1} - Error`);
                    md.push(`- **Error**: ${pdf.error}`);
                } else {
                    md.push(`### Document ${index + 1} - ${pdf.filing.date}`);
                    md.push(`- **Size**: ${pdf.resource.content_length} bytes`);
                    md.push(`- **Access Tests**:`);
                    
                    pdf.accessTests.forEach(test => {
                        const status = test.success ? '✅' : '❌';
                        md.push(`  - ${status} ${test.method}: ${test.success ? test.status : test.error}`);
                    });
                }
                md.push('');
            });
        }
        
        // Key Insights for PDF Parsing
        md.push('## Key Insights for PDF Parsing');
        md.push('');
        
        if (results.insights.pdfDocuments.length > 0) {
            md.push('### PDF Document Characteristics');
            const avgSize = results.insights.pdfDocuments.reduce((sum, doc) => sum + doc.resource.content_length, 0) / results.insights.pdfDocuments.length;
            md.push(`- **Average Size**: ${Math.round(avgSize)} bytes`);
            md.push(`- **Size Range**: ${Math.min(...results.insights.pdfDocuments.map(d => d.resource.content_length))} - ${Math.max(...results.insights.pdfDocuments.map(d => d.resource.content_length))} bytes`);
            md.push('');
            
            md.push('### PDF Access Methods');
            md.push('- Direct API access via document URL');
            md.push('- Content endpoint (`/content` suffix)');
            md.push('- Format parameter (`?format=pdf`)');
            md.push('');
            
            md.push('### Challenges for PDF Parsing');
            md.push('- PDFs may contain scanned images rather than text');
            md.push('- Financial data may be in table format requiring table detection');
            md.push('- Text extraction may require OCR for image-based PDFs');
            md.push('- Data positioning and context recognition needed');
            md.push('');
            
            md.push('### Recommended Approach');
            md.push('1. **Primary**: Use iXBRL when available (structured data)');
            md.push('2. **Fallback**: Extract text from PDF using PDF parsing libraries');
            md.push('3. **OCR**: Use OCR for image-based PDFs as last resort');
            md.push('4. **Pattern Matching**: Implement robust financial data pattern recognition');
            md.push('5. **Table Extraction**: Detect and extract tabular financial data');
        } else {
            md.push('- No PDF documents found for this company');
            md.push('- All filings appear to be in iXBRL format');
        }
        
        return md.join('\n');
    }
}

/**
 * Main execution
 */
async function main() {
    const investigator = new CompanyInvestigator(TARGET_COMPANY, CH_API_KEY);
    
    try {
        const results = await investigator.investigate();
        
        // Print key findings
        console.log('\n' + '='.repeat(80));
        console.log('🎯 KEY FINDINGS FOR PDF PARSING ENHANCEMENT');
        console.log('='.repeat(80));
        
        if (results.insights) {
            console.log(`📊 Total Documents: ${results.insights.totalDocuments}`);
            console.log(`📄 PDF Documents: ${results.insights.pdfDocuments.length}`);
            console.log(`🔧 iXBRL Documents: ${results.insights.ixbrlDocuments.length}`);
            console.log(`📋 Available Formats: ${Array.from(results.insights.availableFormats).join(', ')}`);
            
            if (results.insights.recommendations.length > 0) {
                console.log('\n💡 Recommendations:');
                results.insights.recommendations.forEach(rec => {
                    console.log(`   • ${rec}`);
                });
            }
        }
        
        if (results.pdfDocuments.length > 0) {
            console.log('\n🔍 PDF Access Test Summary:');
            results.pdfDocuments.forEach((pdf, index) => {
                if (pdf.accessTests) {
                    const successfulTests = pdf.accessTests.filter(test => test.success);
                    console.log(`   Document ${index + 1} (${pdf.filing.date}): ${successfulTests.length}/${pdf.accessTests.length} access methods successful`);
                }
            });
        }
        
        console.log('\n📁 Investigation complete! Check the investigation-results directory for detailed reports.');
        
    } catch (error) {
        console.error('❌ Investigation failed:', error.message);
        process.exit(1);
    }
}

// Run the investigation
if (require.main === module) {
    main();
}

module.exports = { CompanyInvestigator };