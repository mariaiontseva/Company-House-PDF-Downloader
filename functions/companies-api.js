const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: 'turntable.proxy.rlwy.net',
  port: 51124,
  user: 'root',
  password: 'FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc',
  database: 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/companies-api', '');
    const { industry } = event.queryStringParameters || {};
    
    let whereClause = 'WHERE CompanyStatus = \'Active\' AND IncorporationDate IS NOT NULL';
    let queryParams = [];
    
    // Add industry filter if provided
    if (industry && industry !== 'ALL') {
      const industryPatterns = {
        'AGRICULTURE': ['01%', '02%', '03%', '10%', '11%', '%AGRICULTURE%', '%FARM%', '%FOOD%', '%CATTLE%'],
        'FINANCIAL': ['64%', '65%', '66%', '%FINANC%', '%INSURANCE%', '%BANK%'],
        'TECHNOLOGY': ['62%', '63%', '%SOFTWARE%', '%COMPUTER%', '%INFORMATION%'],
        'RETAIL': ['45%', '46%', '47%', '%RETAIL%', '%WHOLESALE%', '%SALE%'],
        'MANUFACTURING': ['10%', '11%', '12%', '13%', '14%', '15%', '16%', '17%', '18%', '19%', '20%', '21%', '22%', '23%', '24%', '25%', '26%', '27%', '28%', '29%', '30%', '31%', '32%', '33%', '%MANUFACTUR%'],
        'REAL_ESTATE': ['68%', '%REAL ESTATE%', '%PROPERTY%'],
        'ENERGY': ['05%', '06%', '07%', '08%', '09%', '35%', '%ENERGY%', '%ELECTRIC%', '%GAS%', '%MINING%'],
        'HEALTHCARE': ['86%', '87%', '88%', '%HEALTH%', '%MEDICAL%', '%HOSPITAL%'],
        'TRANSPORT': ['49%', '50%', '51%', '52%', '53%', '%TRANSPORT%'],
        'CONSTRUCTION': ['41%', '42%', '43%', '%CONSTRUCTION%', '%BUILDING%'],
        'SERVICES': ['69%', '70%', '71%', '72%', '73%', '74%', '75%', '%CONSULTING%', '%LEGAL%'],
        'MEDIA': ['58%', '59%', '60%', '90%', '91%'],
        'OTHER': ['%']
      };
      
      const patterns = industryPatterns[industry] || ['%'];
      const sicConditions = patterns.map(() => 'SICCode_SicText_1 LIKE ?').join(' OR ');
      whereClause += ` AND (${sicConditions})`;
      queryParams.push(...patterns);
    }

    let query;
    let orderBy;
    
    if (path === '/api/oldest') {
      orderBy = 'ORDER BY IncorporationDate ASC';
    } else if (path === '/api/newest') {
      orderBy = 'ORDER BY IncorporationDate DESC';
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }

    query = `
      SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate, CompanyCategory,
             RegAddress_PostTown, RegAddress_County, RegAddress_Country,
             SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
             Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
             Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied
      FROM companies 
      ${whereClause}
      ${orderBy}
      LIMIT 5
    `;

    const [results] = await pool.execute(query, queryParams);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(results)
    };

  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Database connection failed',
        message: error.message 
      })
    };
  }
};