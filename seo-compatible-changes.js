// Add these changes to your index.html to support real SEO URLs

// 1. Modify the searchCompany function to support SEO mode
function searchCompanyModified(companyNumber) {
    // ... existing search code ...
    
    // If in SEO mode, don't change the URL
    if (!window.SEO_MODE) {
        // Only update hash if not in SEO mode
        window.location.hash = `#company/${companyNumber}`;
    }
    
    // ... rest of the function
}

// 2. Modify navigation to use SEO URLs when available
function navigateToCompany(companyNumber, companyName, industry) {
    if (window.location.hostname !== 'localhost') {
        // Use SEO URL on production
        const seoUrl = generateCompanySEOUrl(companyNumber, companyName, industry);
        window.location.href = seoUrl;
    } else {
        // Use hash URL on localhost
        window.location.hash = `#company/${companyNumber}`;
    }
}

// 3. Update the generateCompanySEOUrl function
function generateCompanySEOUrl(companyNumber, companyName, industry) {
    const slug = companyName.toLowerCase()
        .replace(/\s+plc$/i, '-plc')
        .replace(/\s+ltd$/i, '-limited')
        .replace(/\s+limited$/i, '-limited')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    const industrySlug = industry ? `-${industry.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
    return `/company/${slug}${industrySlug}-${companyNumber.toLowerCase()}`;
}

// 4. Add structured data for company pages
function addCompanyStructuredData(companyData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": companyData.company_name,
        "identifier": companyData.company_number,
        "url": window.location.href,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": companyData.registered_office_address?.address_line_1,
            "addressLocality": companyData.registered_office_address?.locality,
            "postalCode": companyData.registered_office_address?.postal_code,
            "addressCountry": "GB"
        },
        "foundingDate": companyData.date_of_creation
    });
    document.head.appendChild(script);
}