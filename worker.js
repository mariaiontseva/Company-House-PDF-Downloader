// Cloudflare Worker script for Companies House proxy
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  const apiKey = url.searchParams.get('key')
  const acceptHeader = url.searchParams.get('accept')
  
  if (!targetUrl || !apiKey) {
    return new Response('Missing url or key parameter', { status: 400 })
  }
  
  try {
    // Determine the Accept header
    let accept = 'application/json'
    if (acceptHeader) {
      accept = acceptHeader
    } else if (targetUrl.includes('/content')) {
      accept = 'application/pdf'
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(apiKey + ':'),
        'Accept': accept
      }
    })
    
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    })
  } catch (error) {
    return new Response('Error fetching data', { status: 500 })
  }
}