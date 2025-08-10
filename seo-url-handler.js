// SEO URL Handler - Add this to index.html
function handleSEOUrls() {
    const path = window.location.pathname;
    
    // Check if we're on a company SEO URL
    if (path.startsWith('/company/') && path.length > 9) {
        // Extract company number from SEO URL
        const pathParts = path.substring(9).split('-');
        const companyNumber = pathParts[pathParts.length - 1];
        
        // Validate company number
        if (companyNumber && /^[0-9A-Z]{8}$/i.test(companyNumber)) {
            // Use History API to update URL without reload
            window.history.replaceState({}, '', '/#company/' + companyNumber.toUpperCase());
            
            // Trigger company search
            if (window.searchCompany) {
                window.searchCompany(companyNumber.toUpperCase());
            } else {
                // If searchCompany not ready, wait and try again
                window.addEventListener('load', function() {
                    if (window.searchCompany) {
                        window.searchCompany(companyNumber.toUpperCase());
                    }
                });
            }
        }
    }
}

// Run immediately
handleSEOUrls();

// Also run when page loads
window.addEventListener('DOMContentLoaded', handleSEOUrls);