// Minimal Cloudflare Worker - Just redirects SEO URLs to hash URLs
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Only handle company SEO URLs
  if (url.pathname.startsWith('/company/') && url.pathname.length > 9) {
    // Extract company number from URL
    const pathParts = url.pathname.substring(9).split('-')
    const companyNumber = pathParts[pathParts.length - 1]
    
    // Validate company number
    if (companyNumber && /^[0-9A-Z]{8}$/i.test(companyNumber)) {
      // Redirect to hash URL
      return Response.redirect(url.origin + '/#company/' + companyNumber.toUpperCase(), 301)
    }
  }
  
  // Pass through all other requests unchanged
  return fetch(request)
}