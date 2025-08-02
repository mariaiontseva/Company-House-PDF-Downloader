const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Companies House API key
const CH_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || '22aefa40-ee9e-47c0-b40a-2dd3c03165c6';

// MySQL Database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST || 'turntable.proxy.rlwy.net',
    port: process.env.MYSQL_PORT || 51124,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc',
    database: process.env.MYSQL_DATABASE || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create MySQL connection pool
let pool;
async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('MySQL connection pool created successfully');
        // Test the connection
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection verified');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

// Initialize database connection
initDatabase();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        databaseConnected: !!pool
    });
});

// Railway API endpoints (for database queries)
app.get('/api/railway/companies/search', async (req, res) => {
    try {
        const { type } = req.query;
        let query;
        let params = [];
        
        if (type === 'oldest') {
            query = `
                SELECT CompanyNumber as number, CompanyName as name, 
                       CompanyStatus as status, CompanyCategory as companyType,
                       IncorporationDate as incorporationDate,
                       JSON_OBJECT(
                           'line1', RegAddress_AddressLine1,
                           'line2', RegAddress_AddressLine2,
                           'postTown', RegAddress_PostTown,
                           'county', RegAddress_County,
                           'postCode', RegAddress_PostCode,
                           'country', RegAddress_Country
                       ) as address,
                       SICCode_SicText_1 as sicCodes,
                       Accounts_NextDueDate as accountsNextDue,
                       ConfStmtNextDueDate as confirmationNextDue
                FROM companies
                WHERE IncorporationDate IS NOT NULL 
                AND IncorporationDate < '1900-01-01'
                ORDER BY IncorporationDate ASC
                LIMIT 100
            `;
        } else if (type === 'newest') {
            query = `
                SELECT CompanyNumber as number, CompanyName as name, 
                       CompanyStatus as status, CompanyCategory as companyType,
                       IncorporationDate as incorporationDate,
                       JSON_OBJECT(
                           'line1', RegAddress_AddressLine1,
                           'line2', RegAddress_AddressLine2,
                           'postTown', RegAddress_PostTown,
                           'county', RegAddress_County,
                           'postCode', RegAddress_PostCode,
                           'country', RegAddress_Country
                       ) as address,
                       SICCode_SicText_1 as sicCodes,
                       Accounts_NextDueDate as accountsNextDue,
                       ConfStmtNextDueDate as confirmationNextDue
                FROM companies
                WHERE IncorporationDate IS NOT NULL
                ORDER BY IncorporationDate DESC
                LIMIT 100
            `;
        } else {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
        
        if (!pool) {
            throw new Error('Database connection not available');
        }
        
        const [rows] = await pool.execute(query, params);
        
        // Parse JSON address field
        const companies = rows.map(row => ({
            ...row,
            address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
            sicCodes: row.sicCodes ? [row.sicCodes] : []
        }));
        
        res.json({ companies });
        
    } catch (error) {
        console.error('Railway API error:', error);
        res.status(500).json({ 
            error: 'Database query failed', 
            message: error.message 
        });
    }
});

// Proxy endpoint for Companies House API
app.get('/api/proxy/companies-house/*', async (req, res) => {
    try {
        // Extract the Companies House URL from the request
        const chUrl = req.params[0];
        const queryString = req.originalUrl.split('?')[1] || '';
        const fullUrl = `https://api.companieshouse.gov.uk/${chUrl}${queryString ? '?' + queryString : ''}`;
        
        console.log(`Proxying request to: ${fullUrl}`);
        
        // Make request to Companies House API
        const response = await axios({
            method: 'GET',
            url: fullUrl,
            headers: {
                'Authorization': `Basic ${Buffer.from(CH_API_KEY + ':').toString('base64')}`,
                'Accept': req.headers.accept || '*/*'
            },
            responseType: 'arraybuffer' // Handle binary data
        });
        
        // Forward the response
        res.set({
            'Content-Type': response.headers['content-type'],
            'Cache-Control': 'public, max-age=3600'
        });
        res.send(response.data);
        
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            status: error.response?.status
        });
    }
});

// Proxy endpoint for document API
app.get('/api/proxy/document/*', async (req, res) => {
    try {
        const docUrl = req.params[0];
        const queryString = req.originalUrl.split('?')[1] || '';
        const fullUrl = `https://document-api.company-information.service.gov.uk/${docUrl}${queryString ? '?' + queryString : ''}`;
        
        console.log(`Proxying document request to: ${fullUrl}`);
        
        const response = await axios({
            method: 'GET',
            url: fullUrl,
            headers: {
                'Authorization': `Basic ${Buffer.from(CH_API_KEY + ':').toString('base64')}`,
                'Accept': req.headers.accept || '*/*'
            },
            responseType: 'arraybuffer'
        });
        
        res.set({
            'Content-Type': response.headers['content-type'],
            'Cache-Control': 'public, max-age=3600'
        });
        res.send(response.data);
        
    } catch (error) {
        console.error('Document proxy error:', error.message);
        res.status(error.response?.status || 500).json({
            error: error.message,
            status: error.response?.status
        });
    }
});

// Special endpoint to fetch iXBRL from public website
app.get('/api/proxy/ixbrl/:companyNumber/:transactionId', async (req, res) => {
    try {
        const { companyNumber, transactionId } = req.params;
        const format = req.query.format || 'xhtml';
        
        // Try different URL patterns to get iXBRL
        const urlPatterns = [
            // Public website URL
            `https://find-and-update.company-information.service.gov.uk/company/${companyNumber}/filing-history/${transactionId}/document?format=${format}&download=0`,
            // Direct document API with format
            `https://document-api.company-information.service.gov.uk/document/${transactionId}/content?format=${format}`,
            // Try without /content
            `https://document-api.company-information.service.gov.uk/document/${transactionId}?format=${format}`,
            // Alternative pattern
            `https://beta.companieshouse.gov.uk/company/${companyNumber}/filing-history/${transactionId}/document?format=${format}`
        ];
        
        console.log(`Attempting to fetch iXBRL for company ${companyNumber}, transaction ${transactionId}`);
        
        let lastError = null;
        
        for (const url of urlPatterns) {
            try {
                console.log(`Trying URL: ${url}`);
                
                const response = await axios({
                    method: 'GET',
                    url: url,
                    headers: {
                        'Authorization': `Basic ${Buffer.from(CH_API_KEY + ':').toString('base64')}`,
                        'Accept': 'application/xhtml+xml, text/html, application/xml',
                        'User-Agent': 'Mozilla/5.0 (compatible; CompanyHouseProxy/1.0)'
                    },
                    responseType: 'text',
                    maxRedirects: 5,
                    validateStatus: (status) => status < 500 // Don't throw on 4xx errors
                });
                
                // Check if we got actual iXBRL content
                const content = response.data;
                if (typeof content === 'string' && 
                    (content.includes('<!DOCTYPE') || 
                     content.includes('<html') || 
                     content.includes('ix:') ||
                     content.includes('xmlns:ix'))) {
                    
                    console.log(`Success! Got iXBRL content (${content.length} chars)`);
                    res.set({
                        'Content-Type': 'application/xhtml+xml',
                        'Cache-Control': 'public, max-age=3600'
                    });
                    res.send(content);
                    return;
                } else if (content.startsWith('%PDF')) {
                    console.log('Got PDF instead of iXBRL');
                    lastError = 'PDF returned instead of iXBRL';
                } else if (content.startsWith('{')) {
                    console.log('Got JSON instead of iXBRL');
                    lastError = 'JSON returned instead of iXBRL';
                }
                
            } catch (error) {
                console.log(`Failed with ${url}: ${error.message}`);
                lastError = error;
            }
        }
        
        // If we get here, none of the URLs worked
        throw new Error(lastError?.message || lastError || 'Could not fetch iXBRL from any source');
        
    } catch (error) {
        console.error('iXBRL fetch error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch iXBRL',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  - GET /health');
    console.log('  - GET /api/proxy/companies-house/*');
    console.log('  - GET /api/proxy/document/*');
    console.log('  - GET /api/proxy/ixbrl/:companyNumber/:transactionId');
    console.log('  - GET /api/railway/companies/search');
});