const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Companies House API configuration
const CH_API_KEY = '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';
const TARGET_COMPANY = '08508165'; // JUST CASH FLOW PLC
const PROXY_URL = 'https://blue-flower-d40f.mahin84.workers.dev';

/**
 * Test PDF access using various methods including the proxy server
 */
class PDFAccessTester {
    constructor() {
        this.outputDir = path.join(__dirname, 'pdf-test-results');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Test accessing PDF documents from the company's filings
     */
    async testPDFAccess() {
        console.log('🔍 Testing PDF Access for JUST CASH FLOW PLC (08508165)');
        console.log('=' * 70);

        try {
            // Get the latest filing with PDF
            const filing = await this.getLatestPDFFiling();
            if (!filing) {
                console.log('❌ No PDF filing found');
                return;
            }

            console.log(`\n📄 Testing PDF: ${filing.date} - ${filing.description}`);
            console.log(`   Size: ${filing.pdfSize} bytes`);
            console.log(`   Transaction ID: ${filing.transaction_id}`);

            // Test multiple access methods
            const accessMethods = [
                {
                    name: 'Direct API with Basic Auth',
                    method: () => this.testDirectAPIAccess(filing)
                },
                {
                    name: 'Proxy Server Method',
                    method: () => this.testProxyAccess(filing)
                },
                {
                    name: 'Public Website Method',
                    method: () => this.testPublicWebsiteAccess(filing)
                },
                {
                    name: 'Document API Alternative',
                    method: () => this.testDocumentAPIAlternative(filing)
                }
            ];

            for (const accessMethod of accessMethods) {
                console.log(`\n🔧 Testing: ${accessMethod.name}`);
                try {
                    const result = await accessMethod.method();
                    if (result.success) {
                        console.log(`   ✅ Success: ${result.message}`);
                        
                        // If we got PDF data, save a sample and analyze it
                        if (result.data && result.data.length > 0) {
                            await this.analyzePDFData(result.data, filing, accessMethod.name);
                        }
                    } else {
                        console.log(`   ❌ Failed: ${result.message}`);
                    }
                } catch (error) {
                    console.log(`   ❌ Error: ${error.message}`);
                }
            }

        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    /**
     * Get latest filing with PDF document
     */
    async getLatestPDFFiling() {
        try {
            const response = await axios.get(`https://api.companieshouse.gov.uk/company/${TARGET_COMPANY}/filing-history`, {
                auth: { username: CH_API_KEY, password: '' },
                params: { category: 'accounts', items_per_page: 5 }
            });

            for (const filing of response.data.items) {
                if (filing.links && filing.links.document_metadata) {
                    // Get metadata to check for PDF
                    const metadataResponse = await axios.get(filing.links.document_metadata, {
                        auth: { username: CH_API_KEY, password: '' }
                    });

                    if (metadataResponse.data.resources && metadataResponse.data.resources['application/pdf']) {
                        return {
                            ...filing,
                            documentUrl: metadataResponse.data.links.document,
                            pdfSize: metadataResponse.data.resources['application/pdf'].content_length,
                            metadata: metadataResponse.data
                        };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting PDF filing:', error.message);
            return null;
        }
    }

    /**
     * Test direct API access with Basic Auth
     */
    async testDirectAPIAccess(filing) {
        try {
            const response = await axios.get(filing.documentUrl, {
                auth: { username: CH_API_KEY, password: '' },
                responseType: 'arraybuffer',
                timeout: 30000
            });

            return {
                success: true,
                message: `Downloaded ${response.data.length} bytes`,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: error.response?.status
            };
        }
    }

    /**
     * Test access via proxy server
     */
    async testProxyAccess(filing) {
        try {
            const params = new URLSearchParams({
                url: filing.documentUrl,
                apiKey: CH_API_KEY
            });

            const response = await axios.get(`${PROXY_URL}?${params.toString()}`, {
                timeout: 30000,
                responseType: 'arraybuffer'
            });

            return {
                success: true,
                message: `Downloaded ${response.data.length} bytes via proxy`,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: error.response?.status
            };
        }
    }

    /**
     * Test public website access
     */
    async testPublicWebsiteAccess(filing) {
        try {
            // Build public website URL
            const publicUrl = `https://find-and-update.company-information.service.gov.uk/company/${TARGET_COMPANY}/filing-history/${filing.transaction_id}/document?format=pdf`;

            const response = await axios.get(publicUrl, {
                timeout: 30000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            return {
                success: true,
                message: `Downloaded ${response.data.length} bytes from public website`,
                data: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                status: error.response?.status
            };
        }
    }

    /**
     * Test document API alternative methods
     */
    async testDocumentAPIAlternative(filing) {
        try {
            // Try different endpoints
            const alternativeUrls = [
                filing.documentUrl.replace('/content', ''),
                filing.documentUrl + '?format=pdf',
                filing.documentUrl + '&download=1'
            ];

            for (const url of alternativeUrls) {
                try {
                    const response = await axios.get(url, {
                        auth: { username: CH_API_KEY, password: '' },
                        responseType: 'arraybuffer',
                        timeout: 15000
                    });

                    if (response.data.length > 1000) { // Reasonable PDF size
                        return {
                            success: true,
                            message: `Downloaded ${response.data.length} bytes from ${url}`,
                            data: response.data,
                            contentType: response.headers['content-type']
                        };
                    }
                } catch (error) {
                    continue; // Try next URL
                }
            }

            return {
                success: false,
                message: 'All alternative URLs failed'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Analyze PDF data structure
     */
    async analyzePDFData(pdfData, filing, accessMethod) {
        try {
            console.log(`\n   📊 Analyzing PDF data (${accessMethod}):`);
            
            // Check if it's actually a PDF
            const isPDF = pdfData.slice(0, 4).toString() === '%PDF';
            console.log(`      Is PDF: ${isPDF}`);
            
            if (isPDF) {
                // Save sample PDF
                const filename = `sample-${filing.date}-${accessMethod.replace(/\s+/g, '-')}.pdf`;
                const filepath = path.join(this.outputDir, filename);
                
                fs.writeFileSync(filepath, pdfData);
                console.log(`      ✅ PDF saved: ${filepath}`);
                console.log(`      Size: ${pdfData.length} bytes`);
                
                // Basic PDF analysis
                const pdfText = pdfData.toString('utf8');
                const hasText = pdfText.includes('stream') && pdfText.includes('endstream');
                console.log(`      Contains text streams: ${hasText}`);
                
                // Look for financial keywords in PDF
                const financialKeywords = ['revenue', 'turnover', 'profit', 'loss', 'assets', 'liabilities', 'balance', 'cash'];
                const foundKeywords = financialKeywords.filter(keyword => 
                    pdfText.toLowerCase().includes(keyword)
                );
                console.log(`      Financial keywords found: ${foundKeywords.join(', ') || 'None'}`);
                
                // Check for table structures
                const hasTabularData = pdfText.includes('/Table') || pdfText.includes('/Row') || pdfText.includes('/Cell');
                console.log(`      Has tabular structures: ${hasTabularData}`);
                
                return {
                    isPDF,
                    hasText,
                    foundKeywords,
                    hasTabularData,
                    filepath
                };
            } else {
                console.log(`      ❌ Not a PDF file`);
                console.log(`      First 100 bytes: ${pdfData.slice(0, 100).toString()}`);
            }
        } catch (error) {
            console.log(`      ❌ Error analyzing PDF: ${error.message}`);
        }
    }

    /**
     * Generate test summary report
     */
    generateTestReport(results) {
        const reportPath = path.join(this.outputDir, 'pdf-access-test-report.md');
        
        const report = [
            '# PDF Access Test Report',
            `## Company: JUST CASH FLOW PLC (${TARGET_COMPANY})`,
            `Generated: ${new Date().toISOString()}`,
            '',
            '## Test Results',
            ...results.map(result => {
                return [
                    `### ${result.method}`,
                    `- **Status**: ${result.success ? '✅ Success' : '❌ Failed'}`,
                    `- **Message**: ${result.message}`,
                    result.data ? `- **Data Size**: ${result.data.length} bytes` : '',
                    result.contentType ? `- **Content Type**: ${result.contentType}` : '',
                    ''
                ].filter(line => line !== '').join('\n');
            })
        ];

        fs.writeFileSync(reportPath, report.join('\n'));
        console.log(`\n📄 Test report saved: ${reportPath}`);
    }
}

/**
 * Main execution
 */
async function main() {
    const tester = new PDFAccessTester();
    await tester.testPDFAccess();
}

// Run the test
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PDFAccessTester };