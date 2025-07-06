const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});