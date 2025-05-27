// CRITICAL FIX: Cloudflare Worker for Companies House proxy
// This version properly handles PDF downloads as binary data

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  const apiKey = url.searchParams.get('apiKey') || url.searchParams.get('key') // Support both parameter names
  
  if (!targetUrl || !apiKey) {
    return new Response('Missing url or apiKey parameter', { status: 400 })
  }
  
  try {
    // Determine if this is a PDF request
    const isPdfRequest = targetUrl.includes('/content') || 
                        targetUrl.includes('/document') || 
                        targetUrl.includes('document-api');
    
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(apiKey + ':'),
        'Accept': isPdfRequest ? 'application/pdf' : 'application/json'
      }
    })
    
    // Get response content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // CRITICAL: Handle PDF responses as binary data
    let responseBody
    if (contentType.includes('pdf') || isPdfRequest) {
      // For PDFs, use arrayBuffer to preserve binary data
      responseBody = await response.arrayBuffer()
    } else {
      // For JSON/text responses
      responseBody = await response.text()
    }
    
    // Create response headers with CORS
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Content-Type', contentType)
    
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    })
  } catch (error) {
    console.error('Worker error:', error)
    return new Response('Error fetching data: ' + error.message, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}