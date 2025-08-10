// Debug Cloudflare Worker - Logs all requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Log all requests
  console.log('Worker received request:', {
    url: url.href,
    pathname: url.pathname,
    host: url.host
  })
  
  // Simple test response for /company/* URLs
  if (url.pathname.startsWith('/company/')) {
    // Return a simple HTML page to confirm Worker is intercepting
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Worker Test - Company Page</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: system-ui; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f0f0f0;
          }
          .info {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          code {
            background: #e0e0e0;
            padding: 2px 6px;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <h1>✅ Cloudflare Worker is Active!</h1>
        
        <div class="info">
          <h2>Request Details:</h2>
          <p><strong>URL:</strong> <code>${url.href}</code></p>
          <p><strong>Path:</strong> <code>${url.pathname}</code></p>
          <p><strong>Company Number:</strong> <code>${url.pathname.split('-').pop()}</code></p>
        </div>
        
        <div class="info">
          <h2>Worker Status:</h2>
          <p>✅ Worker is successfully intercepting /company/* requests</p>
          <p>✅ SEO URL is preserved in the address bar</p>
          <p>✅ No hash redirect occurred</p>
        </div>
        
        <div class="info">
          <h2>Next Steps:</h2>
          <p>Now that we know the Worker is active, we can implement the full company page loading logic.</p>
        </div>
        
        <script>
          console.log('Worker test page loaded');
          console.log('Current URL:', window.location.href);
          console.log('No hash redirect - Worker is working correctly!');
        </script>
      </body>
      </html>
    `, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      }
    })
  }
  
  // For all other requests, pass through
  return fetch(request)
}