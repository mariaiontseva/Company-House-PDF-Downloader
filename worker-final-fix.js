// CRITICAL FIX: Cloudflare Worker for Companies House proxy
// This version handles document-api URLs correctly (no auth header for pre-signed URLs)

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
  const apiKey = url.searchParams.get('apiKey') || url.searchParams.get('key')
  
  if (!targetUrl || !apiKey) {
    return new Response('Missing url or apiKey parameter', { status: 400 })
  }
  
  try {
    // CRITICAL FIX: Don't add auth header for document-api URLs (they're pre-signed)
    const isDocumentApi = targetUrl.includes('document-api.company-information.service.gov.uk')
    
    const headers = {}
    
    if (!isDocumentApi) {
      // Only add auth for regular API calls, not document downloads
      headers['Authorization'] = 'Basic ' + btoa(apiKey + ':')
    }
    
    // Set appropriate Accept header
    const isPdfRequest = targetUrl.includes('/content') || 
                        targetUrl.includes('/document') || 
                        isDocumentApi
    
    if (isPdfRequest) {
      headers['Accept'] = 'application/pdf'
    } else {
      headers['Accept'] = 'application/json'
    }
    
    console.log('Target URL:', targetUrl)
    console.log('Is document API:', isDocumentApi)
    console.log('Headers:', headers)
    
    const response = await fetch(targetUrl, { headers })
    
    // Get response content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Handle response body based on content type
    let responseBody
    if (contentType.includes('pdf') || isPdfRequest) {
      // For PDFs, use arrayBuffer to preserve binary data
      responseBody = await response.arrayBuffer()
    } else {
      // For JSON/text responses
      responseBody = await response.text()
    }
    
    // Create response headers with CORS
    const responseHeaders = new Headers()
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type')
    responseHeaders.set('Content-Type', contentType)
    
    console.log('Response status:', response.status)
    console.log('Response size:', responseBody.byteLength || responseBody.length)
    
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
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