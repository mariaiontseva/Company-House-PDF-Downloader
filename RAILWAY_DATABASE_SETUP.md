# Railway Database Connection Guide

## Prerequisites
- Railway account with MySQL database already set up
- Your SQLite database already converted to MySQL and uploaded to Railway
- Railway database connection details (host, port, database name, username, password)

## Step 1: Get Railway Database Connection Details
1. Log into Railway dashboard
2. Click on your MySQL service
3. Go to "Variables" tab
4. Look for these values:
   - `MYSQL_HOST` (something like `mysql.railway.internal` or a public host)
   - `MYSQL_PORT` (usually 3306)
   - `MYSQL_DATABASE` (your database name)
   - `MYSQL_USER` (usually "root")
   - `MYSQL_PASSWORD` (auto-generated password)
   - `MYSQL_PUBLIC_URL` (if available, use this for external connections)

## Step 2: Create API Endpoint File
Create a new file called `api.js` in your project:

```javascript
// api.js
const mysql = require('mysql2/promise');

// Railway connection details
const dbConfig = {
    host: 'YOUR_MYSQL_HOST',
    port: 3306,
    user: 'YOUR_MYSQL_USER',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'YOUR_MYSQL_DATABASE',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Search companies endpoint
async function searchCompanies(query, limit = 20) {
    try {
        const [rows] = await pool.execute(
            `SELECT company_name, company_number, company_status, date_of_creation, registered_office_address_address_line_1, registered_office_address_post_town
             FROM companies 
             WHERE company_name LIKE ? 
             LIMIT ?`,
            [`%${query}%`, limit]
        );
        return rows;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// Get oldest companies
async function getOldestCompanies(limit = 10) {
    try {
        const [rows] = await pool.execute(
            `SELECT company_name, company_number, company_status, date_of_creation, registered_office_address_post_town, sic_code_sic_text_1
             FROM companies 
             WHERE date_of_creation IS NOT NULL 
             ORDER BY date_of_creation ASC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

// Get newest companies
async function getNewestCompanies(limit = 10) {
    try {
        const [rows] = await pool.execute(
            `SELECT company_name, company_number, company_status, date_of_creation, registered_office_address_post_town, sic_code_sic_text_1
             FROM companies 
             WHERE date_of_creation IS NOT NULL 
             ORDER BY date_of_creation DESC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
}

module.exports = { searchCompanies, getOldestCompanies, getNewestCompanies };
```

## Step 3: Create Simple Express Server
Create `server.js`:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { searchCompanies, getOldestCompanies, getNewestCompanies } = require('./api');

const app = express();
app.use(cors());
app.use(express.json());

// Search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Query parameter required' });
        }
        const results = await searchCompanies(q);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Oldest companies endpoint
app.get('/api/oldest', async (req, res) => {
    try {
        const results = await getOldestCompanies();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Newest companies endpoint
app.get('/api/newest', async (req, res) => {
    try {
        const results = await getNewestCompanies();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Step 4: Create package.json
```json
{
  "name": "companies-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "cors": "^2.8.5"
  }
}
```

## Step 5: Deploy API to Railway
1. Create a new service in Railway for your API
2. Connect it to a GitHub repo with the above files
3. Railway will auto-detect Node.js and deploy
4. Get your API URL from Railway (something like `https://your-api.railway.app`)

## Step 6: Update Your Website Frontend
In your `index.html`, add this function to fetch real data:

```javascript
// Add this near your other JavaScript code
const API_URL = 'https://your-api.railway.app'; // Replace with your Railway API URL

async function fetchRealCompanies() {
    try {
        // Fetch oldest companies
        const oldestResponse = await fetch(`${API_URL}/api/oldest`);
        const oldestData = await oldestResponse.json();
        
        // Fetch newest companies  
        const newestResponse = await fetch(`${API_URL}/api/newest`);
        const newestData = await newestResponse.json();
        
        // Update the arrays
        oldestCompanies = oldestData.map(company => ({
            name: company.company_name,
            number: company.company_number,
            year: new Date(company.date_of_creation).getFullYear().toString(),
            location: company.registered_office_address_post_town || 'Unknown',
            status: company.company_status === 'active' ? 'Active' : 'Dissolved',
            industry: extractIndustry(company.sic_code_sic_text_1)
        }));
        
        newestCompanies = newestData.map(company => ({
            name: company.company_name,
            number: company.company_number,
            year: new Date(company.date_of_creation).getFullYear().toString(),
            location: company.registered_office_address_post_town || 'Unknown',
            status: company.company_status === 'active' ? 'Active' : 'Dissolved',
            industry: extractIndustry(company.sic_code_sic_text_1)
        }));
        
        // Re-render if on explore tab
        if (document.getElementById('exploreTab').classList.contains('active')) {
            renderCompanies();
        }
    } catch (error) {
        console.error('Failed to fetch real data:', error);
        // Keep using mock data if fetch fails
    }
}

function extractIndustry(sicText) {
    if (!sicText) return 'OTHER';
    const text = sicText.toLowerCase();
    if (text.includes('tech') || text.includes('software') || text.includes('computer')) return 'TECHNOLOGY';
    if (text.includes('finance') || text.includes('insurance') || text.includes('banking')) return 'FINANCIAL';
    if (text.includes('agriculture') || text.includes('farming') || text.includes('food')) return 'AGRICULTURE';
    return 'OTHER';
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchRealCompanies(); // Fetch real data
});
```

## Step 7: Test Everything
1. Open your website
2. Click on Explore tab
3. You should see real oldest/newest companies from your 5.6M database
4. Toggle between Oldest/Newest views
5. Use Active Only filter

## Troubleshooting

### If Railway API won't deploy:
- Check Railway logs for errors
- Make sure all environment variables are set
- Verify MySQL connection details are correct

### If database connection fails:
- Check if you need to use public URL vs internal URL
- Verify firewall/security settings in Railway
- Test connection with a MySQL client first

### If website can't reach API:
- Check CORS is enabled in your API
- Verify API URL is correct in frontend
- Check browser console for errors
- Make sure API is actually running (check Railway dashboard)

## Alternative: Direct Database Connection from Frontend (NOT RECOMMENDED)
For security reasons, never put database credentials in frontend code. Always use an API layer.

## Next Steps
1. Add search functionality to the API
2. Add pagination for large result sets
3. Add caching to improve performance
4. Add authentication to protect your API
5. Add rate limiting to prevent abuse