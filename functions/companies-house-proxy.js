exports.handler = async (event, context) => {
  const API_KEY = event.queryStringParameters.apiKey;
  const endpoint = event.queryStringParameters.endpoint;
  
  if (!API_KEY || !endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing API key or endpoint' })
    };
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
        'Accept': endpoint.includes('/content') ? 'application/pdf' : 'application/json'
      }
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/pdf')) {
      const buffer = await response.arrayBuffer();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*'
        },
        body: Buffer.from(buffer).toString('base64'),
        isBase64Encoded: true
      };
    } else {
      const data = await response.json();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(data)
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};