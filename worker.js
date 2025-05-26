// Cloudflare Worker script for Companies House proxy
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  const apiKey = url.searchParams.get('key')
  
  if (!targetUrl || !apiKey) {
    return new Response('Missing url or key parameter', { status: 400 })
  }
  
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(apiKey + ':'),
        'Accept': targetUrl.includes('/content') ? 'application/pdf' : 'application/json'
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