// Cloudflare Worker for Real SEO URLs - Intercepts before GitHub Pages 404
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
        // Invalid format, return custom 404
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Company Not Found - DocSpace UK</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: system-ui; background: #0f172a; color: #e2e8f0; 
                     display: flex; align-items: center; justify-content: center; 
                     min-height: 100vh; margin: 0; }
              .container { text-align: center; }
              h1 { font-size: 72px; margin: 0; color: #8b5cf6; }
              p { font-size: 18px; margin: 20px 0; }
              a { color: #8b5cf6; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404</h1>
              <p>Company not found</p>
              <a href="/">Return to search</a>
            </div>
          </body>
          </html>
        `, { 
          status: 404,
          headers: { 'content-type': 'text/html;charset=UTF-8' }
        })
      }
      
      // Fetch index.html directly (bypasses 404.html redirect)
      const indexResponse = await fetch('https://docspace.uk/index.html', {
        cf: {
          // Bypass cache to ensure fresh content
          cacheTtl: 0,
          cacheEverything: false
        }
      })
      
      if (!indexResponse.ok) {
        throw new Error('Failed to fetch index.html')
      }
      
      let html = await indexResponse.text()
      
      // Extract company name from URL for meta tags
      const urlPath = url.pathname.substring(9) // Remove /company/
      const nameParts = urlPath.split('-')
      nameParts.pop() // Remove company number
      const companyName = nameParts.join(' ').replace(/\b\w/g, l => l.toUpperCase())
      
      // Update meta tags for SEO
      const titleRegex = /<title>[^<]*<\/title>/;
      const newTitle = `<title>${companyName} - Company Information | DocSpace UK</title>`;
      html = html.replace(titleRegex, newTitle)
      
      // Replace meta description
      const metaDescRegex = /<meta name="description" content="[^"]*">/;
      const newMetaDesc = `<meta name="description" content="Comprehensive information about ${companyName} (${companyNumber}). View company details, directors, financial data, and official filings from Companies House.">`;
      html = html.replace(metaDescRegex, newMetaDesc)
      
      // Update canonical URL
      if (html.includes('<link rel="canonical"')) {
        html = html.replace(
          /<link rel="canonical"[^>]*>/,
          `<link rel="canonical" href="https://docspace.uk${url.pathname}">`
        )
      } else {
        // Add canonical if missing
        html = html.replace(
          '</head>',
          `<link rel="canonical" href="https://docspace.uk${url.pathname}">\n          </head>`
        )
      }
      
      // Add Open Graph tags for social sharing
      const ogTags = `
        <meta property="og:title" content="${companyName} - Company Information | DocSpace UK">
        <meta property="og:description" content="View detailed information about ${companyName}, including directors, financial data, and company filings.">
        <meta property="og:url" content="https://docspace.uk${url.pathname}">
        <meta property="og:type" content="website">
      `;
      html = html.replace('</head>', ogTags + '</head>')
      
      // Inject script to load company data without changing URL
      const script = `
        <script>
          // SEO URL Handler - Load company data without hash redirect
          (function() {
            const companyNumber = '${companyNumber.toUpperCase()}';
            
            // Set SEO mode flag
            window.SEO_MODE = true;
            window.SEO_COMPANY_NUMBER = companyNumber;
            
            // Override hash change to prevent redirects
            const originalHash = Object.getOwnPropertyDescriptor(window.location, 'hash');
            Object.defineProperty(window.location, 'hash', {
              get: function() { 
                return window.SEO_MODE ? '' : originalHash.get.call(this);
              },
              set: function(value) {
                if (!window.SEO_MODE) {
                  originalHash.set.call(this, value);
                }
              }
            });
            
            // Function to load company without changing URL
            function loadCompanySEO() {
              // Hide homepage elements
              const searchSection = document.querySelector('.search-section');
              const resultsContainer = document.getElementById('resultsContainer');
              const exploreSection = document.getElementById('exploreSection');
              
              if (searchSection) searchSection.style.display = 'none';
              if (exploreSection) exploreSection.style.display = 'none';
              if (resultsContainer) resultsContainer.style.display = 'block';
              
              // Override URL functions temporarily
              const originalPushState = history.pushState;
              const originalReplaceState = history.replaceState;
              history.pushState = function() {};
              history.replaceState = function() {};
              
              // Call search function
              if (typeof searchCompany === 'function') {
                searchCompany(companyNumber);
              }
              
              // Restore URL functions after delay
              setTimeout(() => {
                history.pushState = originalPushState;
                history.replaceState = originalReplaceState;
              }, 500);
            }
            
            // Load when DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', loadCompanySEO);
            } else {
              // Small delay to ensure all scripts are loaded
              setTimeout(loadCompanySEO, 100);
            }
            
            // Handle navigation
            window.addEventListener('popstate', function(e) {
              if (window.location.pathname.startsWith('/company/')) {
                e.preventDefault();
                loadCompanySEO();
              }
            });
          })();
        </script>
      `
      
      // Inject script early in the head to run before other scripts
      html = html.replace(
        '<script>',
        script + '\n<script>'
      )
      
      // Return the modified HTML
      return new Response(html, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'public, max-age=3600',
          'x-robots-tag': 'index, follow',
        }
      })
      
    } catch (error) {
      console.error('Worker error:', error)
      // Return a simple error page instead of passing through to 404.html
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error - DocSpace UK</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: system-ui; background: #0f172a; color: #e2e8f0; 
                   display: flex; align-items: center; justify-content: center; 
                   min-height: 100vh; margin: 0; }
            .container { text-align: center; }
            h1 { color: #ef4444; }
            a { color: #8b5cf6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Something went wrong</h1>
            <p>Please try again later</p>
            <a href="/">Return to search</a>
          </div>
        </body>
        </html>
      `, { 
        status: 500,
        headers: { 'content-type': 'text/html;charset=UTF-8' }
      })
    }
  }
  
  // For all other requests, pass through normally
  return fetch(request)
}