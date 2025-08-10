// Cloudflare Worker for SEO URL routing
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle company SEO URLs
  if (url.pathname.startsWith('/company/')) {
    // Extract company number from URL
    const pathParts = url.pathname.substring(9).split('-')
    const companyNumber = pathParts[pathParts.length - 1]
    
    // Fetch index.html
    const response = await fetch(url.origin + '/index.html')
    let html = await response.text()
    
    // Inject script to load the company
    const script = `
      <script>
        window.INITIAL_COMPANY_NUMBER = '${companyNumber.toUpperCase()}';
        // Load company after page loads
        window.addEventListener('DOMContentLoaded', function() {
          if (window.searchCompany) {
            window.searchCompany('${companyNumber.toUpperCase()}');
          }
        });
      </script>
    `
    
    // Inject before closing body tag
    html = html.replace('</body>', script + '</body>')
    
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      }
    })
  }
  
  // For all other requests, pass through
  return fetch(request)
}