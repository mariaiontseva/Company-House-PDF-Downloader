// Update to make search results use SEO URLs

// 1. Update the displaySearchResults function
function displaySearchResultsWithSEO(data) {
    const companyCard = document.getElementById('companyCard');
    const companyInfo = document.getElementById('companyInfo');
    
    // Store company data
    companyData = data;
    
    // Generate SEO URL for this company
    const companyName = data.company_name || '';
    const companyNumber = data.company_number || '';
    
    // Detect industry from SIC codes or company name
    let industry = '';
    if (data.sic_codes && data.sic_codes.length > 0) {
        // Use your existing detectIndustryFromSIC function
        industry = detectIndustryFromSIC(data.sic_codes);
    }
    
    // Generate the SEO URL
    const seoUrl = generateCompanySEOUrl(companyNumber, companyName, industry);
    
    // Update the browser URL without reload (only on production)
    if (window.location.hostname !== 'localhost' && !window.location.pathname.startsWith('/company/')) {
        // Use History API to update URL
        window.history.pushState(
            { companyNumber: companyNumber }, 
            `${companyName} - DocSpace UK`, 
            seoUrl
        );
        
        // Update meta tags dynamically
        updateMetaTagsForCompany(data);
    }
    
    // Rest of your existing display code...
}

// 2. Update meta tags dynamically when showing a company
function updateMetaTagsForCompany(companyData) {
    // Update title
    document.title = `${companyData.company_name} - Company Information | DocSpace UK`;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Comprehensive information about ${companyData.company_name} (${companyData.company_number}). View company details, directors, financial data, and official filings.`;
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    
    // Update Open Graph tags
    updateOGTag('og:title', `${companyData.company_name} - Company Information | DocSpace UK`);
    updateOGTag('og:url', window.location.href);
    updateOGTag('og:description', `View detailed information about ${companyData.company_name}, including directors, financial data, and company filings.`);
}

function updateOGTag(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
    }
    tag.content = content;
}

// 3. Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.companyNumber) {
        // User navigated back/forward to a company
        searchCompany(event.state.companyNumber);
    } else if (window.location.pathname === '/') {
        // User navigated back to home
        showHomePage();
    }
});

// 4. Update the search function to support both URL types
async function searchCompany(searchTerm) {
    // Show loading state
    showLoading();
    
    try {
        // Your existing search logic...
        const response = await fetch(/* your API call */);
        const data = await response.json();
        
        // Display results with SEO URL update
        displaySearchResultsWithSEO(data);
        
    } catch (error) {
        console.error('Search error:', error);
    }
}

// 5. Function to show home page (when user navigates back)
function showHomePage() {
    // Hide results
    document.getElementById('resultsContainer').style.display = 'none';
    
    // Show search section
    document.querySelector('.search-section').style.display = 'block';
    
    // Show explore section
    document.getElementById('exploreSection').style.display = 'block';
    
    // Reset title and meta tags
    document.title = 'AI Business Intelligence on 5.5M UK Companies | DocSpace';
    updateMetaTagsForCompany({
        company_name: 'DocSpace',
        company_number: ''
    });
}