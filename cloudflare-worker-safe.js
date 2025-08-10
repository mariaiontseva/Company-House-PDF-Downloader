// Safe Cloudflare Worker for SEO URLs - Won't break existing functionality
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Only handle company SEO URLs, pass through everything else
  if (url.pathname.startsWith('/company/') && url.pathname.length > 9) {
    try {
      // Extract company number from URL (e.g., /company/tesco-plc-retail-00445790)
      const pathParts = url.pathname.substring(9).split('-')
      const companyNumber = pathParts[pathParts.length - 1]
      
      // Validate company number format
      if (!companyNumber || !/^[0-9A-Z]{8}$/i.test(companyNumber)) {
        // Invalid format, let it 404 naturally
        return fetch(request)
      }
      
      // Try to fetch index.html
      const indexUrl = new URL('/index.html', url.origin)
      const response = await fetch(indexUrl)
      
      if (!response.ok) {
        // If index.html not found, pass through original request
        return fetch(request)
      }
      
      let html = await response.text()
      
      // Inject a small script to handle the company loading
      const script = `
        <script>
          // SEO URL Handler for Cloudflare
          (function() {
            const companyNumber = '${companyNumber.toUpperCase()}';
            console.log('[SEO URL] Loading company:', companyNumber);
            
            // Method 1: Update hash and reload
            if (window.location.pathname.startsWith('/company/')) {
              window.location.replace('/#company/' + companyNumber);
              return;
            }
            
            // Method 2: If Method 1 fails, try direct search
            function tryLoadCompany() {
              if (typeof searchCompany === 'function') {
                searchCompany(companyNumber);
              } else if (typeof window.searchCompany === 'function') {
                window.searchCompany(companyNumber);
              } else {
                // Try again in 500ms
                setTimeout(tryLoadCompany, 500);
              }
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', tryLoadCompany);
            } else {
              tryLoadCompany();
            }
          })();
        </script>
      `
      
      // Inject before closing body tag
      html = html.replace('</body>', script + '</body>')
      
      // Return modified HTML with proper headers
      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'no-cache', // Disable caching during testing
        }
      })
      
    } catch (error) {
      // If anything goes wrong, pass through to original request
      console.error('Worker error:', error)
      return fetch(request)
    }
  }
  
  // For all non-company URLs, pass through normally
  return fetch(request)
}