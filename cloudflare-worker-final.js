addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Only handle company URLs
  if (!url.pathname.startsWith('/company/')) {
    return fetch(request)
  }
  
  // Extract company number
  const pathParts = url.pathname.substring(9).split('-')
  const companyNumber = pathParts[pathParts.length - 1]
  
  // Validate company number
  if (!companyNumber || !/^[0-9A-Z]{8}$/i.test(companyNumber)) {
    return new Response('Not found', { status: 404 })
  }
  
  // Fetch the index.html
  const response = await fetch('https://docspace.uk/index.html')
  let html = await response.text()
  
  // Add script to load company immediately
  const loadScript = `
    <script>
      // Load company immediately when page loads
      window.addEventListener('DOMContentLoaded', function() {
        // Hide search section
        var searchSection = document.querySelector('.search-section');
        if (searchSection) searchSection.style.display = 'none';
        
        // Hide explore section  
        var exploreSection = document.getElementById('exploreSection');
        if (exploreSection) exploreSection.style.display = 'none';
        
        // Show results
        var resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) resultsContainer.style.display = 'block';
        
        // Search for company
        if (typeof searchCompany === 'function') {
          searchCompany('${companyNumber.toUpperCase()}');
        }
      });
    </script>
  `
  
  // Insert script before closing body tag
  html = html.replace('</body>', loadScript + '</body>')
  
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    }
  })
}