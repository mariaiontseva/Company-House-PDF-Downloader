const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// Import fetch for Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

// Your Railway MySQL connection
const connection = mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 51124,
  user: 'root',
  password: 'FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc',
  database: 'railway'
});

// Get oldest companies with pagination
app.get('/api/oldest/:offset?', (req, res) => {
  const offset = parseInt(req.params.offset) || 0;
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4
    FROM companies 
    WHERE CompanyStatus = 'Active' AND IncorporationDate IS NOT NULL
    ORDER BY IncorporationDate ASC
    LIMIT 5 OFFSET ?
  `;
  
  connection.query(query, [offset], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get newest companies with pagination
app.get('/api/newest/:offset?', (req, res) => {
  const offset = parseInt(req.params.offset) || 0;
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4
    FROM companies
    WHERE CompanyStatus = 'Active' AND IncorporationDate IS NOT NULL
    ORDER BY IncorporationDate DESC
    LIMIT 5 OFFSET ?
  `;
  
  connection.query(query, [offset], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Search companies
app.get('/api/search/:query', (req, res) => {
  const searchQuery = req.params.query;
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate
    FROM companies
    WHERE CompanyName LIKE ? OR CompanyNumber LIKE ?
    ORDER BY CompanyName ASC
    LIMIT 20
  `;
  
  const searchTerm = `%${searchQuery}%`;
  connection.query(query, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get oldest PLC companies
app.get('/api/oldest-plc/:limit?', (req, res) => {
  const limit = parseInt(req.params.limit) || 10;
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4
    FROM companies
    WHERE CompanyStatus = 'Active' 
      AND IncorporationDate IS NOT NULL
      AND CompanyName LIKE '%PLC%'
    ORDER BY IncorporationDate ASC
    LIMIT ?
  `;
  
  connection.query(query, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get total company count
app.get('/api/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN CompanyStatus = 'Active' THEN 1 END) as active,
      COUNT(CASE WHEN CompanyStatus = 'Dissolved' THEN 1 END) as dissolved
    FROM companies
  `;
  
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// OpenAI API proxy endpoint with rate limiting and caching
app.post('/api/openai/completions', async (req, res) => {
  try {
    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Validate request body
    if (!req.body || !req.body.model || !req.body.messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Add rate limiting headers
    res.set({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': Math.ceil(Date.now() / 1000) + 3600
    });

    // Forward request to OpenAI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'DocSpace-UK/1.0'
      },
      body: JSON.stringify({
        ...req.body,
        max_tokens: Math.min(req.body.max_tokens || 300, 500), // Limit max tokens
        temperature: Math.min(req.body.temperature || 0.7, 1.0) // Limit temperature
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return res.status(response.status).json({ 
        error: response.status === 429 ? 'Rate limit exceeded' : 'OpenAI API error' 
      });
    }

    const data = await response.json();
    
    // Add caching headers for successful responses
    res.set({
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'ETag': `"${Buffer.from(JSON.stringify(req.body)).toString('base64')}"`
    });

    res.json(data);

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});