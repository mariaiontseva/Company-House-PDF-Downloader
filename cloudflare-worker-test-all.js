addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Log to Cloudflare dashboard
  console.log('Worker received:', url.pathname)
  
  // For ANY /company/* URL, return a test response
  if (url.pathname.startsWith('/company/')) {
    return new Response('WORKER IS ACTIVE! Path: ' + url.pathname, {
      headers: { 'content-type': 'text/plain' }
    })
  }
  
  // For /worker-test, show it's intercepted
  if (url.pathname === '/worker-test' || url.pathname === '/worker-test.html') {
    return new Response('WORKER INTERCEPTED THIS REQUEST!', {
      headers: { 'content-type': 'text/plain' }
    })
  }
  
  // Pass through all other requests
  return fetch(request)
}