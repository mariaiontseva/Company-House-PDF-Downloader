// Cloudflare Worker for Real SEO URLs - No redirects, proper URL handling
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle company SEO URLs
  if (url.pathname.startsWith('/company/') && url.pathname.length > 9) {
    try {
      // Extract company number from URL
      const pathParts = url.pathname.substring(9).split('-')
      const companyNumber = pathParts[pathParts.length - 1]
      
      // Validate company number
      if (!companyNumber || !/^[0-9A-Z]{8}$/i.test(companyNumber)) {
        // Invalid format, return 404
        return new Response('Company not found', { status: 404 })
      }
      
      // Fetch index.html
      const indexResponse = await fetch(new URL('/index.html', url.origin))
      if (!indexResponse.ok) {
        return new Response('Page not found', { status: 404 })
      }
      
      let html = await indexResponse.text()
      
      // Modify the HTML to:
      // 1. Keep the SEO URL in the address bar
      // 2. Load the company data without using hash
      // 3. Update meta tags for SEO
      
      // Extract company name from URL for meta tags
      const urlPath = url.pathname.substring(9) // Remove /company/
      const nameParts = urlPath.split('-')
      nameParts.pop() // Remove company number
      const companyName = nameParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
      
      // Update meta tags for SEO
      html = html.replace(
        '<title>AI Business Intelligence on 5.5M UK Companies | DocSpace - Companies House Data Platform</title>',
        `<title>${companyName} - Company Information | DocSpace UK</title>`
      )
      
      html = html.replace(
        '<meta name="description" content="Go beyond Companies House. Combine insights from 10+ official UK public data sources into one AI-powered platform. Detect risks, reveal networks, and access documents at scale. Search companies and officers instantly.">',
        `<meta name="description" content="Comprehensive information about ${companyName} (${companyNumber}). View company details, directors, financial data, and official filings from Companies House.">`
      )
      
      // Add canonical URL
      html = html.replace(
        '<link rel="canonical" href="https://docspace.uk/">',
        `<link rel="canonical" href="https://docspace.uk${url.pathname}">`
      )
      
      // Inject script to load company data without changing URL
      const script = `
        <script>
          // Load company data for SEO URL
          (function() {
            const companyNumber = '${companyNumber.toUpperCase()}';
            
            // Override the normal hash-based routing
            window.SEO_MODE = true;
            window.SEO_COMPANY_NUMBER = companyNumber;
            
            // Function to load company without changing URL
            function loadCompanySEO() {
              // Hide the search section and show results
              const searchSection = document.querySelector('.search-section');
              const resultsContainer = document.getElementById('resultsContainer');
              const exploreSection = document.getElementById('exploreSection');
              
              if (searchSection) searchSection.style.display = 'none';
              if (exploreSection) exploreSection.style.display = 'none';
              if (resultsContainer) resultsContainer.style.display = 'block';
              
              // Call the search function if available
              if (typeof searchCompany === 'function') {
                // Temporarily override pushState to prevent URL changes
                const originalPushState = history.pushState;
                history.pushState = function() {};
                
                searchCompany(companyNumber);
                
                // Restore after a delay
                setTimeout(() => {
                  history.pushState = originalPushState;
                }, 100);
              }
            }
            
            // Load when ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', loadCompanySEO);
            } else {
              loadCompanySEO();
            }
            
            // Override the back button behavior
            window.addEventListener('popstate', function(e) {
              if (window.location.pathname.startsWith('/company/')) {
                e.preventDefault();
                // Stay on the SEO URL
                history.pushState(null, '', window.location.pathname);
              }
            });
          })();
        </script>
      `
      
      // Inject before closing body
      html = html.replace('</body>', script + '</body>')
      
      // Return the modified HTML
      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'public, max-age=3600', // Cache for 1 hour
        }
      })
      
    } catch (error) {
      console.error('Worker error:', error)
      return new Response('Internal error', { status: 500 })
    }
  }
  
  // For all other requests, pass through
  return fetch(request)
}